const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// POST /api/locations (livreur envoie sa position)
router.post('/', auth, role('delivery'), async (req, res) => {
  try {
    const { lat, lng, accuracy, heading, speed } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'Latitude et longitude requises' });

    await pool.query(
      `INSERT INTO live_locations (user_id, lat, lng, accuracy, heading, speed, last_update)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET lat = $2, lng = $3, accuracy = $4, heading = $5, speed = $6, last_update = NOW()`,
      [req.user.id, lat, lng, accuracy || null, heading || null, speed || null]
    );
    res.json({ message: 'Position mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/locations (admin voit toutes les positions des livreurs)
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.user_id, l.lat, l.lng, l.accuracy, l.heading, l.speed, l.last_update,
              u.name, u.phone, u.whatsapp, u.role
       FROM live_locations l
       JOIN users u ON l.user_id = u.id
       WHERE u.role = 'delivery' AND u.is_active = true`
    );
    res.json({ locations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/locations/:user_id (position d'un livreur spécifique)
router.get('/:user_id', auth, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { id, role: userRole } = req.user;

    // Vérification d'accès : admin ou client ayant ce livreur sur une commande en cours
    if (userRole === 'customer') {
      const { rows: orderCheck } = await pool.query(
        `SELECT 1 FROM orders
         WHERE customer_id = $1
           AND delivery_person_id = $2
           AND status IN ('assigned', 'in_progress')
         LIMIT 1`,
        [id, user_id]
      );
      if (orderCheck.length === 0) {
        return res.status(403).json({ error: 'Accès interdit' });
      }
    }

    const { rows } = await pool.query(
      `SELECT l.*, u.name, u.phone, u.whatsapp
       FROM live_locations l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id = $1`,
      [user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Position introuvable' });
    res.json({ location: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;