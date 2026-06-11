// db.js – Connexion à PostgreSQL avec le module "pg"

const { Pool } = require('pg');
require('dotenv').config(); // charge le fichier .env

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
    process.exit(1);
  });

module.exports = pool;