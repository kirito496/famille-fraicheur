// models/order.js – Opérations sur les tables orders et order_items

const pool = require('../config/db');

const Order = {
  /**
   * Créer une commande complète (avec transaction)
   * @param {Object} data
   * @param {UUID}   data.customer_id
   * @param {UUID}   data.address_id
   * @param {String} data.delivery_slot   ex: "2026-06-06 10:00,2026-06-06 12:00"
   * @param {String} data.payment_method  "cash" | "mobile_money"
   * @param {String} data.payment_phone   numéro si mobile money
   * @param {Array}  data.items           [{ product_id, quantity, unit_price }]
   * @param {Number} data.total_amount
   * @param {Number} data.delivery_fee
   * @returns {Object} commande créée
   */
  async create({ customer_id, address_id, delivery_slot, payment_method, payment_phone, items, total_amount, delivery_fee }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insérer la commande
      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, address_id, status, payment_method, payment_phone, delivery_slot, total_amount, delivery_fee)
         VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7)
         RETURNING *`,
        [customer_id, address_id, payment_method, payment_phone || null, `[${delivery_slot}]`, total_amount, delivery_fee]
      );
      const order = orderRes.rows[0];

      // 2. Insérer les lignes et décrémenter les stocks
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [order.id, item.product_id, item.quantity, item.unit_price]
        );
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Récupérer les commandes selon le rôle et les filtres
   * @param {Object} options
   * @param {String} options.role   'customer' | 'delivery' | 'admin'
   * @param {UUID}   options.userId
   * @param {String} options.status filtre optionnel
   * @param {Number} options.page
   * @param {Number} options.limit
   */
  async findAll({ role, userId, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = '';
    let countQuery = '';
    const values = [];
    let idx = 1;

    if (role === 'customer') {
      query = `
        SELECT o.*, a.full_address, a.label AS address_label
        FROM orders o
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE o.customer_id = $${idx++}`;
    } else if (role === 'delivery') {
      query = `
        SELECT o.*, a.full_address, a.label AS address_label
        FROM orders o
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE (o.delivery_person_id = $${idx++} OR o.status = 'assigned')`;
    } else if (role === 'admin') {
      query = `
        SELECT o.*, a.full_address, a.label AS address_label,
               c.name AS customer_name, d.name AS delivery_name
        FROM orders o
        LEFT JOIN addresses a ON o.address_id = a.id
        LEFT JOIN users c ON o.customer_id = c.id
        LEFT JOIN users d ON o.delivery_person_id = d.id
        WHERE 1=1`;
    } else {
      return { orders: [], pagination: { total: 0, page, limit, pages: 0 } };
    }

    values.push(userId);

    if (status) {
      query += ` AND o.status = $${idx++}`;
      values.push(status);
    }

    countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ` ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return {
      orders: rows,
      pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10), pages: Math.ceil(total / limit) }
    };
  },

  /**
   * Trouver une commande par ID avec détails complets
   */
  async findById(orderId) {
    const { rows } = await pool.query(
      `SELECT o.*, a.full_address, a.label AS address_label,
              c.name AS customer_name, c.phone AS customer_phone, c.whatsapp AS customer_whatsapp,
              d.name AS delivery_name, d.phone AS delivery_phone, d.whatsapp AS delivery_whatsapp
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN users c ON o.customer_id = c.id
       LEFT JOIN users d ON o.delivery_person_id = d.id
       WHERE o.id = $1`,
      [orderId]
    );
    return rows[0] || null;
  },

  /**
   * Récupérer les articles d'une commande
   */
  async getItems(orderId) {
    const { rows } = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.description AS product_description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return rows;
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateStatus(orderId, status) {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    return rows[0] || null;
  },

  /**
   * Assigner un livreur à une commande et passer le statut à 'assigned'
   */
  async assignDeliveryPerson(orderId, deliveryPersonId) {
    const { rows } = await pool.query(
      `UPDATE orders SET delivery_person_id = $1, status = 'assigned', updated_at = NOW()
       WHERE id = $2 AND status = 'confirmed' RETURNING *`,
      [deliveryPersonId, orderId]
    );
    return rows[0] || null;
  },

  /**
   * Noter une commande et mettre à jour la note moyenne du livreur
   */
  async rateOrder(orderId, customerId, rating, comment = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mettre à jour la note de la commande
      const { rows } = await client.query(
        'UPDATE orders SET rating = $1, rating_comment = $2 WHERE id = $3 AND customer_id = $4 RETURNING delivery_person_id',
        [rating, comment, orderId, customerId]
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const deliveryPersonId = rows[0].delivery_person_id;
      if (deliveryPersonId) {
        // Recalculer et mettre à jour la note moyenne du livreur
        await client.query(
          `UPDATE users SET
            rating_avg = (SELECT COALESCE(AVG(rating),0) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL),
            total_ratings = (SELECT COUNT(*) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL)
          WHERE id = $1`,
          [deliveryPersonId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Signaler un problème sur une commande
   */
  async reportProblem(orderId, customerId, details) {
    const { rowCount } = await pool.query(
      'UPDATE orders SET problem_reported = true, problem_details = $1 WHERE id = $2 AND customer_id = $3',
      [details, orderId, customerId]
    );
    return rowCount > 0;
  }
};

module.exports = Order;