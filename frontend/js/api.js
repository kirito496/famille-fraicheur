// api.js – Fonctions génériques d'appel à l'API REST

const API_BASE = '/api';

/**
 * Effectue une requête HTTP authentifiée
 * @param {string} endpoint - Chemin relatif (ex: '/auth/login')
 * @param {object} options - Options fetch (method, body, headers...)
 * @returns {Promise<object>} Réponse JSON
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Convertir le body en JSON si c'est un objet
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Gérer le cas où la réponse n'est pas du JSON
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // Si token expiré, rediriger vers login
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login.html';
      return;
    }
    const error = new Error((data && data.error) || data || 'Erreur réseau');
    error.status = response.status;
    throw error;
  }

  return data;
}

// Méthodes HTTP pratiques
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};