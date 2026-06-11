const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/addresses – toutes les adresses du client connecté
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ addresses: rows });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/addresses/:id – une adresse (vérification propriétaire)
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Adresse introuvable' });
    res.json({ address: rows[0] });
  } catch (err) {
    console.error('Get address error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/addresses – créer une adresse
router.post('/', auth, async (req, res) => {
  try {
    const { label, full_address, city, district, delivery_price } = req.body;
    const user_id = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO addresses (user_id, label, full_address, city, district)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, label, full_address, city || 'Cotonou', district || '']
    );
    res.status(201).json({ address: rows[0] });
  } catch (err) {
    console.error('Create address error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/addresses/:id – modifier une adresse
router.put('/:id', auth, async (req, res) => {
  try {
    const { label, full_address, city, district } = req.body;
    const user_id = req.user.id;

    const { rowCount } = await pool.query(
      'UPDATE addresses SET label = $1, full_address = $2, city = $3, district = $4 WHERE id = $5 AND user_id = $6',
      [label, full_address, city, district, req.params.id, user_id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Adresse introuvable ou non autorisée' });
    res.json({ message: 'Adresse mise à jour' });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Adresse introuvable' });
    res.json({ message: 'Adresse supprimée' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;