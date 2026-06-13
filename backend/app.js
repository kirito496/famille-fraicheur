// app.js – Application Express (API REST) – CSP corrigée (KkiaPay + Cloudflare)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// ---------- Sécurité (helmet + CSP) ----------
// Autorise : scripts inline, CDN (Socket.IO, Leaflet, Font Awesome, KkiaPay),
// le système anti-robot Cloudflare utilisé par KkiaPay, les WebSockets (chat),
// et les images https (tuiles de carte).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.socket.io",
          "https://unpkg.com",
          "https://cdn.kkiapay.me",
          "https://challenges.cloudflare.com",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
        ],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": [
          "'self'",
          "ws:",
          "wss:",
          "https://api.kkiapay.me",
          "https://cdn.kkiapay.me",
          "https://challenges.cloudflare.com",
        ],
        "frame-src": [
          "'self'",
          "https://cdn.kkiapay.me",
          "https://challenges.cloudflare.com",
        ],
        "font-src": ["'self'", "data:", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);

// ---------- Limiteurs de débit ----------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' },
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, veuillez réessayer plus tard.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ---------- CORS ----------
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGIN || 'https://votredomaine.bj')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------- Parsing ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------- Fichiers statiques (frontend) ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Routes API ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/special-offers', require('./routes/specialOffers'));
// app.use('/api/notifications', require('./routes/notifications')); // Désactivé
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/quartiers', require('./routes/quartiers'));
app.use('/api/delivery-slots', require('./routes/deliverySlots'));
app.use('/api/payments', require('./routes/payments')); // paiement KkiaPay

// Route de debug – désactivée en production
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', require('./routes/debug'));
}

// ---------- Page d'accueil ----------
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ---------- Erreurs 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// ---------- Erreurs globales ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = app;