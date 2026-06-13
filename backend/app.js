// app.js – Application Express (API REST) – version finale sécurisée

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);   // 🔥 obligatoire pour Railway

// ---------- 1. Fichiers statiques AVANT les limiteurs (pour ne pas les compter) ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- 2. Content Security Policy ----------
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
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://fonts.googleapis.com",
        ],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": [
          "'self'",
          "ws:",
          "wss:",
          "https://famille-fraicheur-production.up.railway.app",
          "https://cdnjs.cloudflare.com",   // pour Font Awesome fetch
          "https://unpkg.com",              // pour Leaflet
        ],
        "font-src": [
          "'self'",
          "data:",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
        ],
      },
    },
  })
);

// ---------- 3. Rate limiting (uniquement sur /api/) ----------
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

// ---------- 4. CORS ----------
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGIN || 'https://votredomaine.bj')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---------- 5. Parsing ----------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------- 6. Routes API ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/special-offers', require('./routes/specialOffers'));
// app.use('/api/notifications', require('./routes/notifications'));   // désactivé
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/quartiers', require('./routes/quartiers'));
app.use('/api/delivery-slots', require('./routes/deliverySlots'));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', require('./routes/debug'));
}

// ---------- 7. Homepage ----------
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ---------- 8. Erreurs ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = app;