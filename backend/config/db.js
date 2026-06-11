// db.js – Connexion à PostgreSQL avec le module "pg"

const { Pool } = require('pg');
require('dotenv').config();

// Création d'un pool de connexions vers la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Vérification rapide au démarrage
pool.query('SELECT NOW()')
  .then(res => console.log(`✅ Base connectée – ${res.rows[0].now}`))
  .catch(err => {
    console.error('❌ Erreur de connexion à la base :', err.message);
    console.error('   Vérifie que la variable DATABASE_URL est bien définie dans les Variables du service Railway.');
    // Ne plus quitter le processus pour laisser le serveur tourner (le temps de corriger)
  });

module.exports = pool;