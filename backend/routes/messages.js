const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { sendMessageValidation } = require('../middleware/validate');

// GET /api/messages/conversations (liste des conversations pour l'utilisateur connecté)
router.get('/conversations', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    let query;
    const values = [];

    if (role === 'customer') {
      query = `
        SELECT o.id AS order_id, o.status, o.created_at AS order_date,
               CASE WHEN o.delivery_person_id IS NOT NULL THEN d.name ELSE 'Support' END AS other_party_name,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND sender_id != $1 AND is_read = false) AS unread_count
        FROM orders o LEFT JOIN users d ON o.delivery_person_id = d.id
        WHERE o.customer_id = $1 AND EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
      values.push(id);
    } else if (role === 'delivery') {
      query = `
        SELECT o.id AS order_id, o.status, o.created_at AS order_date,
               c.name AS other_party_name,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND sender_id != $1 AND is_read = false) AS unread_count
        FROM orders o JOIN users c ON o.customer_id = c.id
        WHERE o.delivery_person_id = $1 AND EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
      values.push(id);
    } else if (role === 'admin') {
      query = `
        SELECT o.id AS order_id, o.status, o.created_at AS order_date,
               c.name AS customer_name, COALESCE(d.name, 'Non assigné') AS delivery_name,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND is_read = false) AS unread_count
        FROM orders o
        LEFT JOIN users c ON o.customer_id = c.id
        LEFT JOIN users d ON o.delivery_person_id = d.id
        WHERE EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
    } else {
      return res.status(403).json({ error: 'Rôle non autorisé' });
    }

    const { rows } = await pool.query(query, values);
    res.json({ conversations: rows });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/:order_id (tous les messages d'une commande)
router.get('/:order_id', auth, async (req, res) => {
  try {
    const { order_id } = req.params;
    const { id, role } = req.user;

    const { rows: orderCheck } = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderCheck.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const order = orderCheck[0];

    const hasAccess =
      (role === 'customer' && order.customer_id === id) ||
      (role === 'delivery' && order.delivery_person_id === id) ||
      role === 'admin';
    if (!hasAccess) return res.status(403).json({ error: 'Accès interdit' });

    const { rows: messages } = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.order_id = $1 ORDER BY m.created_at ASC`,
      [order_id]
    );
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages (envoi d'un message)
router.post('/', auth, sendMessageValidation, async (req, res) => {
  try {
    const { order_id, content } = req.body;
    const sender_id = req.user.id;
    const { role } = req.user;

    const { rows: orderCheck } = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderCheck.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const order = orderCheck[0];
    const hasAccess =
      (role === 'customer' && order.customer_id === sender_id) ||
      (role === 'delivery' && order.delivery_person_id === sender_id) ||
      role === 'admin';
    if (!hasAccess) return res.status(403).json({ error: 'Accès interdit' });

    const { rows } = await pool.query(
      `INSERT INTO messages (order_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [order_id, sender_id, content]
    );
    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/messages/read (marquer comme lus)
router.put('/read', auth, async (req, res) => {
  try {
    const { order_id } = req.body;
    await pool.query(
      'UPDATE messages SET is_read = true WHERE order_id = $1 AND sender_id != $2 AND is_read = false',
      [order_id, req.user.id]
    );
    res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;