const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ===========================
// GET /api/users (admin uniquement)
// ===========================
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const { role: filterRole, search, page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT id, name, email, role, phone, whatsapp, rating_avg, total_ratings, is_active, is_online, created_at FROM users WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (filterRole) {
      query += ` AND role = $${idx++}`;
      values.push(filterRole);
    }
    if (search) {
      query += ` AND (name ILIKE $${idx++} OR email ILIKE $${idx++})`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const { rows } = await pool.query(query, values);

    res.json({ users: rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// GET /api/users/:id (admin ou utilisateur lui-même)
// ===========================
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Accès interdit' });

    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, whatsapp, rating_avg, total_ratings, is_active, is_online, created_at FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// PUT /api/users/:id (admin)
// ===========================
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ['name', 'email', 'role', 'phone', 'whatsapp', 'is_active', 'is_online']) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ à modifier' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, phone, whatsapp, is_active, is_online, updated_at`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.constraint === 'users_email_key') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// DELETE /api/users/:id (admin)
// ===========================
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true', ['admin']);
    if (parseInt(adminCount.rows[0].count) <= 1) {
      const userToDelete = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
      if (userToDelete.rows.length > 0 && userToDelete.rows[0].role === 'admin')
        return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur' });
    }
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// PUT /api/users/:id/status (admin active/désactive)
// ===========================
router.put('/:id/status', auth, role('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;
    const { rows } = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active',
      [is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user: rows[0], message: `Compte ${is_active ? 'activé' : 'désactivé'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// PUT /api/users/:id/online-status (livreur ou admin)
// ===========================
router.put('/:id/online-status', auth, async (req, res) => {
  try {
    // Seul le livreur lui-même ou un admin peut modifier son statut en ligne
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { is_online } = req.body; // doit être true ou false
    if (typeof is_online !== 'boolean') {
      return res.status(400).json({ error: 'is_online doit être un booléen (true/false)' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET is_online = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_online',
      [is_online, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    res.json({ user: rows[0], message: is_online ? 'Livreur en ligne' : 'Livreur hors ligne' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;