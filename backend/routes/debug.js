const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Route temporaire de développement : affiche le token de réinitialisation d'un email
router.get('/reset-token/:email', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT reset_token, reset_token_expires FROM users WHERE email = $1',
      [req.params.email]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Email introuvable' });

    const token = rows[0].reset_token;
    const expires = rows[0].reset_token_expires;
    if (!token || new Date(expires) < new Date()) {
      return res.status(400).json({ error: 'Aucun token valide. Refaites une demande de mot de passe oublié.' });
    }

    // Renvoie le lien cliquable
    res.send(`Lien de réinitialisation : <a href="http://localhost:3000/reset-password.html?token=${token}">http://localhost:3000/reset-password.html?token=${token}</a>`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;