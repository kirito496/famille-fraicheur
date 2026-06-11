// models/message.js – Opérations sur la table messages

const pool = require('../config/db');

const Message = {
  /**
   * Récupérer la liste des conversations pour un utilisateur
   * @param {UUID} userId
   * @param {String} role  'customer' | 'delivery' | 'admin'
   */
  async getConversations(userId, role) {
    let query;
    const values = [];
    let idx = 1;

    if (role === 'customer') {
      query = `
        SELECT o.id AS order_id,
               o.status,
               o.created_at AS order_date,
               CASE WHEN o.delivery_person_id IS NOT NULL THEN d.name ELSE 'Support' END AS other_party_name,
               CASE WHEN o.delivery_person_id IS NOT NULL THEN d.whatsapp ELSE NULL END AS other_party_whatsapp,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND sender_id != $1 AND is_read = false) AS unread_count
        FROM orders o
        LEFT JOIN users d ON o.delivery_person_id = d.id
        WHERE o.customer_id = $1
          AND EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
      values.push(userId);
    } else if (role === 'delivery') {
      query = `
        SELECT o.id AS order_id,
               o.status,
               o.created_at AS order_date,
               c.name AS other_party_name,
               c.whatsapp AS other_party_whatsapp,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND sender_id != $1 AND is_read = false) AS unread_count
        FROM orders o
        JOIN users c ON o.customer_id = c.id
        WHERE o.delivery_person_id = $1
          AND EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
      values.push(userId);
    } else if (role === 'admin') {
      query = `
        SELECT o.id AS order_id,
               o.status,
               o.created_at AS order_date,
               c.name AS customer_name,
               COALESCE(d.name, 'Non assigné') AS delivery_name,
               (SELECT content FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message,
               (SELECT created_at FROM messages WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
               (SELECT COUNT(*) FROM messages WHERE order_id = o.id AND is_read = false) AS unread_count
        FROM orders o
        LEFT JOIN users c ON o.customer_id = c.id
        LEFT JOIN users d ON o.delivery_person_id = d.id
        WHERE EXISTS (SELECT 1 FROM messages WHERE order_id = o.id)
        ORDER BY last_message_time DESC NULLS LAST`;
    }

    const { rows } = await pool.query(query, values);
    return rows;
  },

  /**
   * Récupérer tous les messages d'une commande
   */
  async getByOrder(orderId) {
    const { rows } = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.order_id = $1
       ORDER BY m.created_at ASC`,
      [orderId]
    );
    return rows;
  },

  /**
   * Enregistrer un nouveau message
   */
  async create({ order_id, sender_id, content }) {
    const { rows } = await pool.query(
      `INSERT INTO messages (order_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [order_id, sender_id, content]
    );
    return rows[0];
  },

  /**
   * Marquer tous les messages non lus d'une commande comme lus pour un utilisateur donné
   */
  async markAsRead(orderId, userId) {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE order_id = $1 AND sender_id != $2 AND is_read = false',
      [orderId, userId]
    );
  },

  /**
   * Vérifier si un utilisateur a accès à une commande pour le chat
   */
  async canAccessOrder(orderId, userId, role) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (rows.length === 0) return false;
    const order = rows[0];
    if (role === 'customer' && order.customer_id === userId) return true;
    if (role === 'delivery' && order.delivery_person_id === userId) return true;
    if (role === 'admin') return true;
    return false;
  }
};

module.exports = Message;