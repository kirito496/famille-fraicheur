const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'famille_fraicheur_secret_key_change_me';

function socketHandler(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log('⚠️ Socket rejeté : token manquant');
        return next(new Error('Token manquant'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error('❌ Socket authentification échouée :', err.message);
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.name;
    const userRole = socket.user.role;

    console.log(`✅ Socket connecté : ${userName} (${userRole})`);

    socket.join(`user_${userId}`);
    if (userRole === 'admin') socket.join('admins');

    try {
      let activeOrders;
      if (userRole === 'customer') {
        activeOrders = await pool.query(
          `SELECT id FROM orders WHERE customer_id = $1 AND status NOT IN ('delivered','cancelled','returned')`,
          [userId]
        );
      } else if (userRole === 'delivery') {
        activeOrders = await pool.query(
          `SELECT id FROM orders WHERE delivery_person_id = $1 AND status NOT IN ('delivered','cancelled','returned')`,
          [userId]
        );
      }
      if (activeOrders?.rows) {
        activeOrders.rows.forEach(o => socket.join(`order_${o.id}`));
      }
    } catch (err) {
      console.error('Erreur jonction rooms:', err);
    }

    // Envoi de message
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { order_id, content } = data;
        const sender_id = socket.user.id;
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (order.rows.length === 0) {
          if (callback) return callback({ error: 'Commande introuvable' });
          return;
        }
        const o = order.rows[0];
        const canSend =
          (userRole === 'customer' && o.customer_id === sender_id) ||
          (userRole === 'delivery' && o.delivery_person_id === sender_id) ||
          userRole === 'admin';
        if (!canSend) {
          if (callback) return callback({ error: 'Accès interdit' });
          return;
        }
        const msg = await pool.query(
          `INSERT INTO messages (order_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
          [order_id, sender_id, content]
        );
        const message = { ...msg.rows[0], sender_name: socket.user.name };
        io.to(`order_${order_id}`).emit('newMessage', message);

        if (o.customer_id && o.customer_id !== sender_id) {
          io.to(`user_${o.customer_id}`).emit('notification', { type: 'message', order_id });
        }
        if (o.delivery_person_id && o.delivery_person_id !== sender_id) {
          io.to(`user_${o.delivery_person_id}`).emit('notification', { type: 'message', order_id });
        }
        if (callback) callback({ success: true, message });
      } catch (err) {
        console.error('sendMessage error:', err);
        if (callback) callback({ error: 'Erreur serveur' });
      }
    });

    // Marquer comme lus
    socket.on('markRead', async (order_id) => {
      try {
        await pool.query(
          'UPDATE messages SET is_read = true WHERE order_id = $1 AND sender_id != $2 AND is_read = false',
          [order_id, userId]
        );
      } catch (err) {
        console.error('markRead error:', err);
      }
    });

    // Mise à jour position
    socket.on('updateLocation', async (data, callback) => {
      try {
        if (userRole !== 'delivery') return;
        const { lat, lng, accuracy, heading, speed } = data;
        if (!lat || !lng) return;
        await pool.query(
          `INSERT INTO live_locations (user_id, lat, lng, accuracy, heading, speed, last_update)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (user_id)
           DO UPDATE SET lat = $2, lng = $3, accuracy = $4, heading = $5, speed = $6, last_update = NOW()`,
          [userId, lat, lng, accuracy || null, heading || null, speed || null]
        );
        io.to('admins').emit('locationUpdate', {
          user_id: userId, name: userName, lat, lng, accuracy, heading, speed, last_update: new Date()
        });
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('updateLocation error:', err);
        if (callback) callback({ error: 'Erreur' });
      }
    });

    // Changement statut commande
    socket.on('statusChange', async (data, callback) => {
      try {
        const { order_id, newStatus } = data;
        const order = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (order.rows.length === 0) return;
        const o = order.rows[0];
        io.to(`order_${order_id}`).emit('orderStatusChanged', { order_id, status: newStatus });
        if (userRole === 'delivery' && o.customer_id) {
          io.to(`user_${o.customer_id}`).emit('notification', { type: 'status', order_id, status: newStatus });
        } else if (userRole === 'customer' && o.delivery_person_id) {
          io.to(`user_${o.delivery_person_id}`).emit('notification', { type: 'status', order_id, status: newStatus });
        }
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('statusChange error:', err);
        if (callback) callback({ error: 'Erreur' });
      }
    });

    // Déconnexion : ignorer les fermetures normales (transport close)
    socket.on('disconnect', (reason) => {
      if (reason !== 'transport close') {
        console.log(`❌ Socket déconnecté anormalement : ${userName}, raison: ${reason}`);
      }
    });
  });

  return io;
}

module.exports = socketHandler;