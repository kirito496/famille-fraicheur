// helpers.js – Fonctions utilitaires partagées

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param {number} lat1  Latitude du point 1
 * @param {number} lng1  Longitude du point 1
 * @param {number} lat2  Latitude du point 2
 * @param {number} lng2  Longitude du point 2
 * @returns {number}      Distance en kilomètres
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convertit des degrés en radians
 * @param {number} deg
 * @returns {number}
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Estime le temps de trajet en minutes selon la distance (supposition : 30 km/h moyen en ville)
 * @param {number} distanceKm
 * @returns {number} minutes
 */
function estimateTravelTime(distanceKm, averageSpeedKmh = 30) {
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.round((distanceKm / averageSpeedKmh) * 60);
}

/**
 * Calcule la distance et le temps estimé entre un livreur et un client
 * @param {object} deliveryPosition  { lat, lng }
 * @param {object} clientPosition   { lat, lng }
 * @returns {object} { distanceKm, estimatedMinutes }
 */
function getDeliveryInfo(deliveryPosition, clientPosition) {
  if (!deliveryPosition || !clientPosition ||
      !deliveryPosition.lat || !deliveryPosition.lng ||
      !clientPosition.lat || !clientPosition.lng) {
    return { distanceKm: null, estimatedMinutes: null };
  }
  const dist = haversineDistance(
    deliveryPosition.lat, deliveryPosition.lng,
    clientPosition.lat, clientPosition.lng
  );
  return {
    distanceKm: parseFloat(dist.toFixed(2)),
    estimatedMinutes: estimateTravelTime(dist),
  };
}

/**
 * Formate un créneau de livraison (TSTZRANGE) en chaînes lisibles
 * @param {string} slot   Exemple: "[2026-06-06 10:00:00+01,2026-06-06 12:00:00+01)"
 * @returns {object} { start, end, startFormatted, endFormatted }
 */
function parseDeliverySlot(slot) {
  if (!slot) return null;
  const match = slot.match(/\["?([^",]+)"?,\s*"?([^"]+)"?\)/);
  if (!match) return null;
  const start = new Date(match[1]);
  const end = new Date(match[2]);
  const options = { hour: '2-digit', minute: '2-digit' };
  return {
    start,
    end,
    startFormatted: start.toLocaleTimeString('fr-FR', options),
    endFormatted: end.toLocaleTimeString('fr-FR', options),
  };
}

/**
 * Calcule le temps restant avant la fin d'un créneau
 * @param {string} slot
 * @returns {number} secondes restantes, ou 0 si dépassé
 */
function timeRemainingInSlot(slot) {
  const parsed = parseDeliverySlot(slot);
  if (!parsed) return 0;
  const now = new Date();
  const diff = parsed.end - now;
  return diff > 0 ? Math.floor(diff / 1000) : 0;
}

/**
 * Vérifie si une adresse est dans une zone livrable (simulé)
 * @param {string} city
 * @param {string} district
 * @returns {boolean}
 */
function isDeliverable(city, district) {
  const zones = ['Cotonou', 'Calavi', 'Abomey-Calavi'];
  return zones.some(z => city.toLowerCase().includes(z.toLowerCase()) ||
    (district && district.toLowerCase().includes(z.toLowerCase())));
}

/**
 * Calcule les frais de livraison selon la zone (simplifié)
 * @param {string} city
 * @returns {number}
 */
function calculateDeliveryFee(city) {
  const cityLower = (city || '').toLowerCase();
  if (cityLower.includes('cotonou')) return 500;
  if (cityLower.includes('calavi') || cityLower.includes('abomey-calavi')) return 800;
  return 1500; // hors zone
}

module.exports = {
  haversineDistance,
  estimateTravelTime,
  getDeliveryInfo,
  parseDeliverySlot,
  timeRemainingInSlot,
  isDeliverable,
  calculateDeliveryFee,
};