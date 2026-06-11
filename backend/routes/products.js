const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { productValidation } = require('../middleware/validate');
const upload = require('../middleware/upload'); // 🆕 Middleware d'upload

// GET /api/products (avec filtres)
router.get('/', async (req, res) => {
  try {
    const { category, search, available, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (category) { query += ` AND c.name = $${idx++}`; values.push(category); }
    if (search)   { query += ` AND p.name ILIKE $${idx++}`; values.push(`%${search}%`); }
    if (available === 'true') { query += ` AND p.is_available = true AND p.stock > 0`; }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count);

    query += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const { rows } = await pool.query(query, values);

    res.json({ products: rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/categories/all
router.get('/categories/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/products (admin) – avec upload image
router.post('/', auth, role('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, expiration, category_id } = req.body;
    let image_url = null;
    if (req.file) {
      // Le middleware upload enregistre dans frontend/images/offers/
      // Pour les produits, on utilise le même dossier (ou on peut créer un sous-dossier products)
      image_url = `/images/offers/${req.file.filename}`;
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock, expiration, image_url, category_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description, price, stock || 0, expiration || null, image_url, category_id || null]
    );
    res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/products/:id (admin) – avec upload image (corrigé)
router.put('/:id', auth, role('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, expiration, category_id, is_available } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    // Tous les champs texte sont lus depuis req.body (grâce à multer)
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(stock); }
    if (expiration !== undefined) { fields.push(`expiration = $${idx++}`); values.push(expiration); }
    if (category_id !== undefined) { fields.push(`category_id = $${idx++}`); values.push(category_id); }
    if (is_available !== undefined) { fields.push(`is_available = $${idx++}`); values.push(is_available); }

    // Si une nouvelle image est uploadée, on met à jour image_url
    if (req.file) {
      fields.push(`image_url = $${idx++}`);
      values.push(`/images/offers/${req.file.filename}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucun champ à modifier' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' });

    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Produit introuvable' });
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;