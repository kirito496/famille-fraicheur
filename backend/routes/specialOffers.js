const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// ===========================
// GET /api/special-offers (public) – offres actives avec leurs produits
// ===========================
router.get('/', async (req, res) => {
  try {
    const { rows: offers } = await pool.query(
      `SELECT * FROM special_offers
       WHERE is_active = TRUE AND start_date <= NOW() AND end_date > NOW()
       ORDER BY created_at DESC`
    );

    const result = await Promise.all(offers.map(async (offer) => {
      const { rows: products } = await pool.query(
        `SELECT p.id, p.name, p.price, p.stock, p.expiration, p.image_url,
                c.name AS category_name
         FROM offer_products op
         JOIN products p ON op.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE op.offer_id = $1`,
        [offer.id]
      );
      return { ...offer, products };
    }));

    res.json({ offers: result });
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// POST /api/special-offers (admin) – créer une offre avec plusieurs produits et image
// ===========================
router.post('/', auth, role('admin'), upload.single('image'), async (req, res) => {
  const client = await pool.connect();
  try {
    // product_ids peut être une chaîne (si un seul produit) ou un tableau (plusieurs)
    const product_ids = [].concat(req.body.product_ids || []);
    const { discount_percent, start_date, end_date } = req.body;

    if (product_ids.length === 0) {
      return res.status(400).json({ error: 'Au moins un produit requis' });
    }
    if (!discount_percent || !end_date) {
      return res.status(400).json({ error: 'discount_percent et end_date requis' });
    }

    // Gestion de l'image uploadée
    let image_url = null;
    if (req.file) {
      image_url = `/images/offers/${req.file.filename}`;
    }

    await client.query('BEGIN');

    // Créer l'offre
    const { rows: offerRow } = await client.query(
      `INSERT INTO special_offers (discount_percent, start_date, end_date, image_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [discount_percent, start_date || new Date(), end_date, image_url]
    );
    const offer = offerRow[0];

    // Insérer les produits liés
    for (const productId of product_ids) {
      const { rows: prod } = await client.query('SELECT id FROM products WHERE id = $1', [productId]);
      if (prod.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Produit ${productId} introuvable` });
      }
      await client.query(
        'INSERT INTO offer_products (offer_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [offer.id, productId]
      );
    }

    await client.query('COMMIT');

    // Récupérer l'offre complète avec les produits
    const { rows: products } = await pool.query(
      `SELECT p.id, p.name FROM offer_products op JOIN products p ON op.product_id = p.id WHERE op.offer_id = $1`,
      [offer.id]
    );

    res.status(201).json({ offer: { ...offer, products } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create offer error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// ===========================
// PUT /api/special-offers/:id (admin) – modifier une offre
// ===========================
router.put('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { discount_percent, start_date, end_date, is_active, image_url, product_ids } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (discount_percent !== undefined) { fields.push(`discount_percent = $${idx++}`); values.push(discount_percent); }
    if (start_date !== undefined) { fields.push(`start_date = $${idx++}`); values.push(start_date); }
    if (end_date !== undefined) { fields.push(`end_date = $${idx++}`); values.push(end_date); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
    if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(image_url); }

    if (fields.length > 0) {
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE special_offers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Offre introuvable' });
    }

    // Mettre à jour la liste des produits si fournie
    if (product_ids && Array.isArray(product_ids)) {
      await pool.query('DELETE FROM offer_products WHERE offer_id = $1', [id]);
      for (const productId of product_ids) {
        await pool.query(
          'INSERT INTO offer_products (offer_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, productId]
        );
      }
    }

    const { rows: offerResult } = await pool.query('SELECT * FROM special_offers WHERE id = $1', [id]);
    const { rows: products } = await pool.query(
      `SELECT p.id, p.name FROM offer_products op JOIN products p ON op.product_id = p.id WHERE op.offer_id = $1`,
      [id]
    );

    res.json({ offer: { ...offerResult[0], products } });
  } catch (err) {
    console.error('Update offer error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// DELETE /api/special-offers/:id (admin)
// ===========================
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM special_offers WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Offre introuvable' });
    res.json({ message: 'Offre supprimée' });
  } catch (err) {
    console.error('Delete offer error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;