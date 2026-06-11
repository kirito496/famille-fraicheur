// map.js – Fonctions utilitaires pour les cartes Leaflet

/**
 * Initialise une carte Leaflet dans un conteneur
 * @param {string} containerId - ID de l'élément HTML
 * @param {object} center - { lat, lng } centre initial
 * @param {number} zoom - niveau de zoom (défaut 13)
 * @returns {object} instance de la carte Leaflet
 */
function initMap(containerId, center = { lat: 6.3703, lng: 2.3912 }, zoom = 13) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Si une carte existe déjà sur cet élément, la retourner
  if (container._leaflet_map) {
    container._leaflet_map.invalidateSize();
    return container._leaflet_map;
  }

  const map = L.map(container).setView([center.lat, center.lng], zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; CartoDB'
  }).addTo(map);

  // Stocker la référence pour réutilisation
  container._leaflet_map = map;
  return map;
}

/**
 * Ajoute un marqueur sur la carte avec une popup optionnelle
 * @param {object} map - instance Leaflet
 * @param {object} position - { lat, lng }
 * @param {string} popupContent - HTML pour la popup
 * @param {object} options - options du marqueur (color, icon, etc.)
 * @returns {object} le marqueur Leaflet
 */
function addMarker(map, position, popupContent = '', options = {}) {
  const color = options.color || 'green';
  const marker = L.circleMarker([position.lat, position.lng], {
    radius: 8,
    color: color,
    fillColor: color,
    fillOpacity: 0.7
  });

  if (popupContent) {
    marker.bindPopup(popupContent);
  }

  marker.addTo(map);
  return marker;
}

/**
 * Crée un marqueur pour un livreur (bleu)
 */
function addDeliveryMarker(map, position, name, whatsapp = '') {
  const popup = `<strong>🚚 ${name}</strong><br>${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` +
    (whatsapp ? `<br><a href="https://wa.me/${whatsapp}" target="_blank">WhatsApp</a>` : '');
  return addMarker(map, position, popup, { color: 'blue' });
}

/**
 * Crée un marqueur pour un client (vert)
 */
function addClientMarker(map, position, name) {
  const popup = `<strong>📍 ${name}</strong><br>${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
  return addMarker(map, position, popup, { color: 'green' });
}

/**
 * Calcule et affiche une ligne entre deux points
 * @param {object} map - instance Leaflet
 * @param {object} from - { lat, lng }
 * @param {object} to - { lat, lng }
 */
function drawRoute(map, from, to) {
  const latlngs = [
    [from.lat, from.lng],
    [to.lat, to.lng]
  ];
  L.polyline(latlngs, { color: 'orange', weight: 3, dashArray: '5,10' }).addTo(map);
}

/**
 * Centre la carte sur une position avec animation
 */
function flyTo(map, position, zoom = 15) {
  map.flyTo([position.lat, position.lng], zoom, { duration: 1 });
}

/**
 * Supprime toutes les couches de marqueurs d'une carte
 */
function clearMap(map) {
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker || layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
}