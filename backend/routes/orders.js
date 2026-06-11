const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { createOrderValidation, updateOrderStatusValidation } = require('../middleware/validate');
const { calculateDeliveryFee } = require('../utils/helpers');

// ===========================
// POST /api/orders (client crée une commande) – transaction_code optionnel
// ===========================
router.post('/', auth, role('customer'), createOrderValidation, async (req, res) => {
  const client = await pool.connect();
  try {
    const { address_id, delivery_slot, payment_phone, transaction_code, items, delivery_mode } = req.body;
    const customer_id = req.user.id;

    // Vérification du numéro de téléphone
    if (!payment_phone || payment_phone.length < 8) {
      return res.status(400).json({ error: 'Numéro Mobile Money requis.' });
    }

    await client.query('BEGIN');

    // 1. Vérifier l'adresse
    const addr = await client.query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [address_id, customer_id]);
    if (addr.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Adresse introuvable.' });
    }

    // 2. Vérifier les stocks et calculer le total produits
    let total = 0;
    const productUpdates = [];
    for (const item of items) {
      const prod = await client.query('SELECT * FROM products WHERE id = $1 AND is_available = true', [item.product_id]);
      if (prod.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Produit ${item.product_id} indisponible.` });
      }
      if (prod.rows[0].stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Stock insuffisant pour "${prod.rows[0].name}".` });
      }
      total += parseFloat(prod.rows[0].price) * item.quantity;
      productUpdates.push({ id: item.product_id, quantity: item.quantity, price: prod.rows[0].price });
    }

    // 3. Mode de livraison
    const mode = delivery_mode || 'classic';

    // 4. Calculer les frais de livraison
    let delivery_fee = 500;
    if (req.body.delivery_fee) {
      delivery_fee = parseFloat(req.body.delivery_fee);
    } else {
      delivery_fee = calculateDeliveryFee(5, mode);
    }

    const total_amount = total + delivery_fee;

    // 5. Créneau tstzrange
    const [startSlot, endSlot] = delivery_slot.split('-');
    const today = new Date().toISOString().slice(0, 10);
    const slotRange = `[${today} ${startSlot}:00, ${today} ${endSlot}:00)`;

    // 6. Insérer la commande avec statut 'pending_payment'
    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, address_id, status, payment_method, payment_phone, transaction_code, delivery_slot, total_amount, delivery_fee, delivery_mode)
       VALUES ($1, $2, 'pending_payment', 'mobile_money', $3, $4, $5::tstzrange, $6, $7, $8)
       RETURNING *`,
      [customer_id, address_id, payment_phone, transaction_code || null, slotRange, total_amount, delivery_fee, mode]
    );
    const order = orderRes.rows[0];

    // 7. Insérer les lignes et décrémenter les stocks
    for (const item of productUpdates) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.id, item.quantity, item.price]
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ order, message: 'Commande enregistrée. En attente de confirmation du paiement.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande.' });
  } finally {
    client.release();
  }
});

// ===========================
// PUT /api/orders/:id/confirm-payment (admin confirme le paiement)
// ===========================
router.put('/:id/confirm-payment', auth, role('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE orders SET status = 'confirmed', updated_at = NOW()
       WHERE id = $1 AND status = 'pending_payment'
       RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Commande introuvable ou déjà traitée.' });
    }
    res.json({ order: rows[0], message: 'Paiement confirmé. Commande visible par les livreurs.' });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// GET /api/orders (liste selon rôle)
// ===========================
router.get('/', auth, async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery;
    const values = [];
    let idx = 1;

    switch (userRole) {
      case 'customer':
        baseQuery = `SELECT o.*, a.full_address, a.label AS address_label FROM orders o LEFT JOIN addresses a ON o.address_id = a.id WHERE o.customer_id = $${idx++}`;
        values.push(userId);
        break;
      case 'delivery':
        baseQuery = `SELECT o.*, a.full_address, a.label AS address_label FROM orders o LEFT JOIN addresses a ON o.address_id = a.id WHERE (o.delivery_person_id = $${idx++} OR (o.status = 'confirmed' AND o.delivery_person_id IS NULL))`;
        values.push(userId);
        break;
      case 'admin':
        baseQuery = `SELECT o.*, a.full_address, a.label AS address_label, c.name AS customer_name, d.name AS delivery_name FROM orders o LEFT JOIN addresses a ON o.address_id = a.id LEFT JOIN users c ON o.customer_id = c.id LEFT JOIN users d ON o.delivery_person_id = d.id WHERE 1=1`;
        break;
      default:
        return res.status(403).json({ error: 'Rôle non autorisé' });
    }

    if (status) {
      baseQuery += ` AND o.status = $${idx++}`;
      values.push(status);
    }

    const countQuery = baseQuery.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    baseQuery += ` ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const { rows } = await pool.query(baseQuery, values);
    res.json({ orders: rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// GET /api/orders/:id (détail avec items)
// ===========================
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT o.*, a.full_address, a.label AS address_label,
              c.name AS customer_name, c.phone AS customer_phone, c.whatsapp AS customer_whatsapp,
              d.name AS delivery_name, d.phone AS delivery_phone, d.whatsapp AS delivery_whatsapp
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN users c ON o.customer_id = c.id
       LEFT JOIN users d ON o.delivery_person_id = d.id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const order = orders[0];
    const { role, id: userId } = req.user;
    if (role === 'customer' && order.customer_id !== userId) return res.status(403).json({ error: 'Accès interdit' });
    if (role === 'delivery' && order.delivery_person_id !== userId && !(order.status === 'confirmed' || order.status === 'assigned')) return res.status(403).json({ error: 'Accès interdit' });
    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name AS product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
      [req.params.id]
    );
    res.json({ order, items });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ===========================
// PUT /api/orders/:id/status (changement de statut)
// ===========================
router.put('/:id/status', auth, updateOrderStatusValidation, async (req, res) => {
  try {
    const { status } = req.body;
    const { role, id: userId } = req.user;
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const order = rows[0];
    if (role === 'customer' && order.customer_id !== userId) return res.status(403).json({ error: 'Accès interdit' });
    if (role === 'delivery' && order.delivery_person_id !== userId) return res.status(403).json({ error: 'Non assigné' });
    const { rows: updated } = await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json({ order: updated[0], message: `Statut changé en "${status}".` });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ===========================
// PUT /api/orders/:id/assign (admin)
// ===========================
router.put('/:id/assign', auth, role('admin'), async (req, res) => {
  try {
    const { delivery_person_id } = req.body;
    const { rows } = await pool.query(
      `UPDATE orders SET delivery_person_id = $1, status = 'assigned', updated_at = NOW() WHERE id = $2 AND status = 'confirmed' RETURNING *`,
      [delivery_person_id, req.params.id]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Commande introuvable ou non confirmée.' });
    res.json({ order: rows[0], message: 'Livreur assigné.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ===========================
// PUT /api/orders/:id/take (livreur prend une commande)
// ===========================
router.put('/:id/take', auth, role('delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const delivery_person_id = req.user.id;

    const { rows } = await pool.query(
      `UPDATE orders SET delivery_person_id = $1, status = 'assigned', updated_at = NOW()
       WHERE id = $2 AND status = 'confirmed' AND delivery_person_id IS NULL
       RETURNING *`,
      [delivery_person_id, id]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Commande introuvable ou déjà prise.' });
    }
    res.json({ order: rows[0], message: 'Commande prise en charge.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ===========================
// PUT /api/orders/:id/rate (client)
// ===========================
router.put('/:id/rate', auth, role('customer'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: userId } = req.user;
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [req.params.id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    await pool.query('UPDATE orders SET rating = $1, rating_comment = $2 WHERE id = $3', [rating, comment || null, req.params.id]);
    if (rows[0].delivery_person_id) {
      await pool.query(
        `UPDATE users SET rating_avg = (SELECT COALESCE(AVG(rating),0) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL),
         total_ratings = (SELECT COUNT(*) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL) WHERE id = $1`,
        [rows[0].delivery_person_id]
      );
    }
    res.json({ message: 'Merci pour votre évaluation.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

// ===========================
// PUT /api/orders/:id/report (client)
// ===========================
router.put('/:id/report', auth, role('customer'), async (req, res) => {
  try {
    const { details } = req.body;
    const { id: userId } = req.user;
    const { rowCount } = await pool.query(
      'UPDATE orders SET problem_reported = true, problem_details = $1 WHERE id = $2 AND customer_id = $3',
      [details, req.params.id, userId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ message: 'Problème signalé.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;