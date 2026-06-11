// models/product.js – Opérations sur les tables products et categories

const pool = require('../config/db');

const Product = {
  /**
   * Récupère une liste paginée de produits avec filtres optionnels
   */
  async findAll({ category, search, available, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (category) {
      query += ` AND c.name = $${idx++}`;
      values.push(category);
    }
    if (search) {
      query += ` AND p.name ILIKE $${idx++}`;
      values.push(`%${search}%`);
    }
    if (available === 'true') {
      query += ` AND p.is_available = true AND p.stock > 0`;
    }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ` ORDER BY p.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return {
      products: rows,
      pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10), pages: Math.ceil(total / limit) }
    };
  },

  /**
   * Trouver un produit par son ID
   */
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Créer un nouveau produit
   */
  async create({ name, description, price, stock, expiration, image_url, category_id }) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock, expiration, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, price, stock || 0, expiration || null, image_url || null, category_id || null]
    );
    return rows[0];
  },

  /**
   * Mettre à jour un produit (champs dynamiques)
   */
  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = keys.map(key => fields[key]);

    const query = `UPDATE products SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0] || null;
  },

  /**
   * Supprimer un produit
   */
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  },

  /**
   * Décrémenter le stock d'un produit (utilisé à la création de commande)
   */
  async decreaseStock(id, quantity) {
    await pool.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, id]
    );
  },

  /**
   * Vérifier la disponibilité d'une liste de produits et retourner leurs prix
   * Retourne un tableau d'objets { id, name, price, stock, available }
   */
  async checkAvailability(items) {
    const ids = items.map(i => i.product_id);
    const { rows } = await pool.query(
      'SELECT id, name, price, stock, is_available FROM products WHERE id = ANY($1)',
      [ids]
    );
    return rows;
  },

  /**
   * Récupérer toutes les catégories
   */
  async findAllCategories() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  }
};

module.exports = Product;