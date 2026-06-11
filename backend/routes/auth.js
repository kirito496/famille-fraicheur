const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validate');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email'); // 🆕

const JWT_SECRET = process.env.JWT_SECRET || 'famille_fraicheur_secret_key_change_me';

// ========================
// POST /api/auth/login
// ========================
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez un administrateur.' });
    }
    // Seuls les clients doivent avoir leur email vérifié
    if (user.role === 'customer' && !user.email_verified) {
      return res.status(403).json({ error: 'Veuillez vérifier votre adresse email avant de vous connecter.' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        rating_avg: user.rating_avg,
        is_online: user.is_online
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// POST /api/auth/register
// ========================
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, password, role, phone, whatsapp } = req.body;

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) { /* token invalide → inscription libre */ }
    }

    const finalRole = isAdmin ? role : 'customer';

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const { rows: newUser } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, whatsapp, verification_code, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING id, name, email, role, phone, whatsapp, email_verified, is_online`,
      [name, email, password_hash, finalRole, phone || null, whatsapp || null, verificationCode]
    );

    // Envoyer le code par email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de vérification :", err);
    }

    if (isAdmin) {
      return res.status(201).json({ user: newUser[0] });
    }

    res.status(201).json({
      message: 'Compte créé. Veuillez vérifier votre email avec le code reçu.',
      userId: newUser[0].id
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// POST /api/auth/verify-email
// ========================
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'ID utilisateur et code requis.' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const user = rows[0];

    if (user.email_verified) return res.status(400).json({ error: 'Cet email est déjà vérifié.' });
    if (user.verification_code !== code) return res.status(400).json({ error: 'Code de vérification incorrect.' });

    await pool.query(
      'UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE id = $1',
      [userId]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email vérifié avec succès.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        is_online: user.is_online
      }
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// POST /api/auth/forgot-password
// ========================
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const { email } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }
    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000);
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    );

    // Envoyer le lien par email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation :", err);
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// POST /api/auth/reset-password
// ========================
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const { token, password } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Token invalide ou expiré.' });
    const user = rows[0];
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [password_hash, user.id]
    );
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// GET /api/auth/me (protégé)
// ========================
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, phone, whatsapp, rating_avg, total_ratings, is_active, is_online, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================
// PUT /api/auth/me (protégé)
// ========================
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, whatsapp } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (phone) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (whatsapp) { fields.push(`whatsapp = $${idx++}`); values.push(whatsapp); }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à modifier.' });
    }
    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );
    res.json({ message: 'Profil mis à jour.' });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;