const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/favorites (liste des favoris du client connecté)
router.get('/', auth, role('customer'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.product_id, p.name, p.price, p.stock, p.expiration, p.image_url, p.is_available,
              c.name AS category_name, f.created_at AS added_at
       FROM user_favorites f
       JOIN products p ON f.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ favorites: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/favorites (ajouter un produit aux favoris)
router.post('/', auth, role('customer'), async (req, res) => {
  try {
    const { product_id } = req.body;
    // Vérifier que le produit existe
    const { rows: prod } = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (prod.length === 0) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    await pool.query(
      `INSERT INTO user_favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, product_id]
    );
    res.status(201).json({ message: 'Produit ajouté aux favoris' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/favorites/:product_id (retirer un favori)
router.delete('/:product_id', auth, role('customer'), async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.product_id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Favori introuvable' });
    res.json({ message: 'Produit retiré des favoris' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;