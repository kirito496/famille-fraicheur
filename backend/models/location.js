// models/location.js – Opérations sur la table live_locations

const pool = require('../config/db');

const Location = {
  /**
   * Enregistrer ou mettre à jour la position d'un livreur
   */
  async upsert({ user_id, lat, lng, accuracy, heading, speed }) {
    await pool.query(
      `INSERT INTO live_locations (user_id, lat, lng, accuracy, heading, speed, last_update)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET lat = $2, lng = $3, accuracy = $4, heading = $5, speed = $6, last_update = NOW()`,
      [user_id, lat, lng, accuracy || null, heading || null, speed || null]
    );
  },

  /**
   * Récupérer toutes les positions des livreurs actifs (pour l'admin)
   */
  async getAllActive() {
    const { rows } = await pool.query(
      `SELECT l.user_id, l.lat, l.lng, l.accuracy, l.heading, l.speed, l.last_update,
              u.name, u.phone, u.whatsapp, u.role
       FROM live_locations l
       JOIN users u ON l.user_id = u.id
       WHERE u.role = 'delivery' AND u.is_active = true`
    );
    return rows;
  },

  /**
   * Récupérer la position d'un livreur spécifique
   */
  async getByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT l.*, u.name, u.phone, u.whatsapp
       FROM live_locations l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  }
};

module.exports = Location;