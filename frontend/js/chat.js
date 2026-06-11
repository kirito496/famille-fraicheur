// chat.js – Gestion du chat temps réel (Socket.io) partagé entre les pages

let chatSocket = null;
let unreadCount = 0;
let onUnreadUpdate = null; // callback pour mettre à jour l'UI

/**
 * Initialise la connexion Socket.io pour le chat
 * et écoute les événements de nouveaux messages et notifications.
 * @param {function} unreadCallback - fonction appelée avec le nombre de messages non lus
 * @returns {object} l'instance socket
 */
function initChat(unreadCallback) {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // Éviter de créer plusieurs sockets
  if (chatSocket && chatSocket.connected) {
    if (unreadCallback) onUnreadUpdate = unreadCallback;
    return chatSocket;
  }

  chatSocket = io({ auth: { token } });

  chatSocket.on('connect', () => {
    console.log('🔌 Chat socket connecté');
    // Rejoindre les rooms des commandes actives est géré côté serveur
  });

  chatSocket.on('newMessage', (message) => {
    // Si une page a un gestionnaire local pour afficher le message, elle le fera.
    // Ici on met à jour le badge global.
    fetchUnreadCount();
    // Jouer un son léger (optionnel)
    playNotificationSound();
  });

  chatSocket.on('notification', (data) => {
    if (data.type === 'message') {
      fetchUnreadCount();
      playNotificationSound();
    }
  });

  chatSocket.on('disconnect', () => {
    console.log('🔌 Chat socket déconnecté');
  });

  if (unreadCallback) onUnreadUpdate = unreadCallback;
  // Charger le nombre de messages non lus au démarrage
  fetchUnreadCount();

  return chatSocket;
}

/**
 * Récupère le nombre total de messages non lus via l'API
 * et met à jour le badge
 */
async function fetchUnreadCount() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch('/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    unreadCount = (data.conversations || []).reduce(
      (sum, conv) => sum + parseInt(conv.unread_count || 0), 0
    );
    if (onUnreadUpdate) onUnreadUpdate(unreadCount);
    updateBadge(unreadCount);
  } catch (err) {
    console.error('Erreur fetchUnreadCount', err);
  }
}

/**
 * Met à jour l'élément visuel du badge (à appeler dans les pages)
 * @param {number} count
 */
function updateBadge(count) {
  const badge = document.getElementById('messageBadge');
  if (badge) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/**
 * Marque tous les messages d'une commande comme lus
 * @param {string} orderId
 */
async function markMessagesRead(orderId) {
  if (chatSocket && chatSocket.connected) {
    chatSocket.emit('markRead', orderId);
  }
  // Également via API pour être sûr
  try {
    await fetch('/api/messages/read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ order_id: orderId })
    });
    fetchUnreadCount();
  } catch (err) {
    console.error('Erreur markMessagesRead', err);
  }
}

/**
 * Joue un son de notification (court bip)
 */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silencieux si non supporté
  }
}