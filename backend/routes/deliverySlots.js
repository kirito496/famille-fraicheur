const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ===========================
// GET /api/delivery-slots (public)
// Retourne les créneaux actifs dont l'heure limite de commande n'est pas dépassée
// ===========================
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8); // format HH:MM:SS

    const { rows } = await pool.query(
      `SELECT * FROM delivery_slots
       WHERE is_active = TRUE
         AND (order_deadline IS NULL OR order_deadline > $1)
       ORDER BY start_time`,
      [currentTime]
    );
    res.json({ slots: rows });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// GET /api/delivery-slots/all (admin)
// Retourne tous les créneaux (sans filtre de disponibilité)
// ===========================
router.get('/all', auth, role('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM delivery_slots ORDER BY start_time');
    res.json({ slots: rows });
  } catch (err) {
    console.error('Get all slots error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// POST /api/delivery-slots (admin)
// Créer un nouveau créneau (avec option order_deadline)
// ===========================
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { start_time, end_time, max_orders, order_deadline } = req.body;
    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time et end_time requis' });
    }
    const { rows } = await pool.query(
      `INSERT INTO delivery_slots (start_time, end_time, max_orders, order_deadline)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [start_time, end_time, max_orders || 10, order_deadline || null]
    );
    res.status(201).json({ slot: rows[0] });
  } catch (err) {
    console.error('Create slot error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// PUT /api/delivery-slots/:id (admin)
// Modifier un créneau (y compris order_deadline)
// ===========================
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, max_orders, is_active, order_deadline } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    if (start_time !== undefined) { fields.push(`start_time = $${idx++}`); values.push(start_time); }
    if (end_time !== undefined) { fields.push(`end_time = $${idx++}`); values.push(end_time); }
    if (max_orders !== undefined) { fields.push(`max_orders = $${idx++}`); values.push(max_orders); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
    if (order_deadline !== undefined) { fields.push(`order_deadline = $${idx++}`); values.push(order_deadline); }

    if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ à modifier' });
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE delivery_slots SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Créneau introuvable' });
    res.json({ slot: rows[0] });
  } catch (err) {
    console.error('Update slot error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// DELETE /api/delivery-slots/:id (admin)
// ===========================
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM delivery_slots WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Créneau introuvable' });
    res.json({ message: 'Créneau supprimé' });
  } catch (err) {
    console.error('Delete slot error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;