const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const webpush = require('web-push');

// Configuration VAPID (clés générées ou récupérées depuis .env)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'votre_cle_privee_vapid_a_generer';

// Configurer web-push avec les clés et l'email de contact
webpush.setVapidDetails(
  'mailto:contact@famillefraicheur.bj',
  vapidPublicKey,
  vapidPrivateKey
);

// ===========================
// POST /api/notifications/subscribe (tout utilisateur connecté)
// Enregistre un abonnement push
// ===========================
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body; // { p256dh, auth }
    const userId = req.user.id;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Données d\'abonnement incomplètes' });
    }

    // Insérer ou mettre à jour l'abonnement
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, endpoint) DO UPDATE SET keys = $3`,
      [userId, endpoint, JSON.stringify(keys)]
    );

    res.json({ message: 'Abonnement enregistré' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// POST /api/notifications/send (admin uniquement)
// Envoie une notification push à tous les abonnés
// ===========================
router.post('/send', auth, role('admin'), async (req, res) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    // Récupérer tous les abonnements
    const { rows: subscriptions } = await pool.query(
      'SELECT * FROM push_subscriptions'
    );

    if (subscriptions.length === 0) {
      return res.json({ message: 'Aucun abonné', sent: 0 });
    }

    // Préparer le payload de la notification
    const payload = JSON.stringify({
      title: title,
      body: body,
      url: url || '/',
      icon: '/images/icon-192.png',
      badge: '/images/icon-192.png'
    });

    let successCount = 0;
    let failCount = 0;

    // Envoyer à chaque abonné
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys // déjà en objet JS grâce au type JSONB
          },
          payload
        );
        successCount++;
      } catch (err) {
        console.error('Échec envoi push:', err.statusCode, err.body);
        failCount++;
        // Si l'abonnement n'est plus valide (410 Gone), le supprimer
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
        }
      }
    }

    res.json({
      message: `Notification envoyée`,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length
    });

  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===========================
// GET /api/notifications/subscribers (admin uniquement)
// Nombre d'abonnés aux notifications
// ===========================
router.get('/subscribers', auth, role('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM push_subscriptions');
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;