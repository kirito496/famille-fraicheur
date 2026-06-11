// utils.js – Fonctions utilitaires génériques pour le frontend

/**
 * Formate un montant en FCFA (ex: 1500 → "1 500 FCFA")
 * @param {number} amount
 * @returns {string}
 */
function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}

/**
 * Formate une date ISO en format lisible (ex: "06/06/2026 14:30")
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Parse un créneau de livraison (champ TSTZRANGE PostgreSQL)
 * @param {string} slot - ex: "[2026-06-06 10:00:00+01,2026-06-06 12:00:00+01)"
 * @returns {object|null} { start, end, startFormatted, endFormatted }
 */
function parseDeliverySlot(slot) {
  if (!slot) return null;
  const match = slot.match(/\["?([^"]+)"?,\s*"?([^"]+)"?\)/);
  if (!match) return null;
  const start = new Date(match[1]);
  const end = new Date(match[2]);
  const options = { hour: '2-digit', minute: '2-digit' };
  return {
    start,
    end,
    startFormatted: start.toLocaleTimeString('fr-FR', options),
    endFormatted: end.toLocaleTimeString('fr-FR', options)
  };
}

/**
 * Calcule le temps restant en secondes avant la fin d'un créneau
 * @param {string} slot
 * @returns {number} secondes restantes (0 si dépassé)
 */
function timeRemainingInSlot(slot) {
  const parsed = parseDeliverySlot(slot);
  if (!parsed) return 0;
  const diff = parsed.end - new Date();
  return diff > 0 ? Math.floor(diff / 1000) : 0;
}

/**
 * Lance un compte à rebours et met à jour un élément HTML
 * @param {string} slot - créneau PostgreSQL
 * @param {string} elementId - ID de l'élément où afficher le compte à rebours
 * @param {function} onExpired - callback quand le temps est écoulé
 * @returns {number|null} intervalId ou null
 */
function startCountdown(slot, elementId, onExpired = null) {
  const el = document.getElementById(elementId);
  if (!el) return null;

  const updateDisplay = () => {
    const remaining = timeRemainingInSlot(slot);
    if (remaining <= 0) {
      el.textContent = 'Dépassé';
      el.style.color = 'var(--red)';
      if (onExpired) onExpired();
      return true; // signaler que c'est fini
    }
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    el.textContent = `${h}h ${m}m ${s}s restantes`;
    el.style.color = 'var(--orange)';
    return false;
  };

  if (updateDisplay()) return null; // déjà expiré

  return setInterval(() => {
    if (updateDisplay()) {
      clearInterval(intervalId);
    }
  }, 1000);
}

/**
 * Affiche une notification toast temporaire
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - ms (défaut 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const colors = {
    success: '#388E3C',
    error: '#D32F2F',
    info: '#212121'
  };
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '…';
}

/**
 * Retourne le label lisible d'un statut de commande
 * @param {string} status
 * @returns {string}
 */
function statusLabel(status) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    assigned: 'Assignée',
    in_progress: 'En cours',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    returned: 'Retournée'
  };
  return labels[status] || status;
}

/**
 * Retourne la classe CSS correspondant à un statut
 * @param {string} status
 * @returns {string}
 */
function statusClass(status) {
  return `status-${status}`;
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 * @param {string} role
 * @returns {boolean}
 */
function isRole(role) {
  return localStorage.getItem('userRole') === role;
}

/**
 * Obtient l'ID de l'utilisateur connecté
 * @returns {string|null}
 */
function getUserId() {
  return localStorage.getItem('userId');
}