// models/user.js – Opérations sur la table users

const pool = require('../config/db');

const User = {
  /**
   * Trouver un utilisateur par son email (retourne tout, y compris password_hash)
   */
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  /**
   * Trouver un utilisateur par son ID (sans le mot de passe)
   */
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, whatsapp, rating_avg, total_ratings, is_active, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Créer un nouvel utilisateur
   */
  async create({ name, email, passwordHash, role, phone, whatsapp }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, whatsapp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, phone, whatsapp, created_at`,
      [name, email, passwordHash, role, phone || null, whatsapp || null]
    );
    return rows[0];
  },

  /**
   * Mettre à jour un utilisateur (champs dynamiques)
   */
  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = keys.map(key => fields[key]);

    const query = `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0] || null;
  },

  /**
   * Supprimer un utilisateur
   */
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },

  /**
   * Définir le token de réinitialisation de mot de passe
   */
  async setResetToken(id, token, expires) {
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, id]
    );
  },

  /**
   * Réinitialiser le mot de passe via token
   */
  async resetPassword(token, newPasswordHash) {
    const { rows } = await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2 AND reset_token_expires > NOW() RETURNING id',
      [newPasswordHash, token]
    );
    return rows[0] || null;
  },

  /**
   * Mettre à jour la note moyenne d'un livreur
   */
  async updateRating(deliveryPersonId) {
    await pool.query(
      `UPDATE users SET
        rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL),
        total_ratings = (SELECT COUNT(*) FROM orders WHERE delivery_person_id = $1 AND rating IS NOT NULL)
       WHERE id = $1`,
      [deliveryPersonId]
    );
  },

  /**
   * Récupérer tous les utilisateurs (admin) avec filtres et pagination
   */
  async findAll({ role, search, page = 1, limit = 30 }) {
    const offset = (page - 1) * limit;
    let query = `SELECT id, name, email, role, phone, whatsapp, rating_avg, total_ratings, is_active, created_at FROM users WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (role) {
      query += ` AND role = $${idx++}`;
      values.push(role);
    }
    if (search) {
      query += ` AND (name ILIKE $${idx++} OR email ILIKE $${idx++})`;
      values.push(`%${search}%`, `%${search}%`);
    }

    // Compter le total
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return { users: rows, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /**
   * Récupérer les livreurs actifs (pour admin ou clients)
   */
  async getActiveDeliveryPersons() {
    const { rows } = await pool.query(
      `SELECT id, name, phone, whatsapp, rating_avg FROM users
       WHERE role = 'delivery' AND is_active = true
       ORDER BY name`
    );
    return rows;
  }
};

module.exports = User;