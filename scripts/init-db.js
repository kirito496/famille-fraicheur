// scripts/init-db.js
// Initialise la base de données PostgreSQL en exécutant les fichiers SQL
// dans l'ordre défini. Conçu pour être lancé comme étape pré-déploiement
// sur Railway : `node scripts/init-db.js`

'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ── Configuration ────────────────────────────────────────────────────────────

const SQL_FILES = [
  'schema.sql',          // 1. Schéma (tables, index, extensions)
  'insert_products.sql', // 2. Catégories et produits (UTF-8 avec accents)
  'insert_all_utf8.sql', // 3. Catégories et produits (ASCII sans accents)
  'add_promos.sql',      // 4. Tables promotions et notifications push
  'update_promos.sql',   // 5. Améliorations des promotions
];

const DATABASE_DIR = path.join(__dirname, '..', 'database');

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = { info: 'ℹ️ ', ok: '✅', warn: '⚠️ ', error: '❌' }[level] || '  ';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    log('error', 'La variable DATABASE_URL est absente. Arrêt du script.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  log('info', `Connexion à la base de données…`);

  // Vérification de la connexion avant de commencer
  try {
    const res = await pool.query('SELECT NOW()');
    log('ok', `Base connectée – ${res.rows[0].now}`);
  } catch (err) {
    log('error', `Impossible de se connecter à la base : ${err.message}`);
    await pool.end();
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const filename of SQL_FILES) {
    const filePath = path.join(DATABASE_DIR, filename);

    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      log('warn', `Fichier introuvable, ignoré : ${filename}`);
      skipCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    log('info', `Exécution de ${filename}…`);

    // Chaque fichier est exécuté dans sa propre transaction.
    // En cas d'erreur (ex : migration déjà appliquée), on logue et on continue.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      log('ok', `${filename} exécuté avec succès.`);
      successCount++;
    } catch (err) {
      await client.query('ROLLBACK');

      // Erreurs bénignes : objet déjà existant (42P07 = table, 42710 = index…)
      const ALREADY_EXISTS_CODES = ['42P07', '42710', '42701', '23505'];
      if (ALREADY_EXISTS_CODES.includes(err.code)) {
        log('warn', `${filename} ignoré (déjà appliqué ou conflit) : ${err.message}`);
        skipCount++;
      } else {
        log('error', `Erreur lors de l'exécution de ${filename} : ${err.message}`);
        errorCount++;
      }
    } finally {
      client.release();
    }
  }

  await pool.end();

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log('');
  log('info', '─── Résumé de l\'initialisation ───────────────────────────');
  log('ok',   `Succès  : ${successCount} fichier(s)`);
  if (skipCount > 0)  log('warn',  `Ignorés : ${skipCount} fichier(s)`);
  if (errorCount > 0) log('error', `Erreurs : ${errorCount} fichier(s)`);
  log('info', '──────────────────────────────────────────────────────────');

  if (errorCount > 0) {
    log('error', 'Des erreurs sont survenues. Vérifiez les logs ci-dessus.');
    process.exit(1);
  }

  log('ok', 'Initialisation de la base de données terminée.');
  process.exit(0);
}

main();
