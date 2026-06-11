// auth.js – Gestion de l'authentification côté client

/**
 * Vérifie si l'utilisateur est connecté.
 * Redirige vers login.html si aucun token trouvé.
 * @param {string|null} requiredRole – Rôle obligatoire ('admin','delivery','customer')
 */
function requireAuth(requiredRole = null) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    // Si un rôle spécifique est requis et que l'utilisateur ne l'a pas (sauf admin qui passe partout)
    alert('Accès réservé.');
    logout();
    return false;
  }

  return true;
}

/**
 * Déconnecte l'utilisateur (vide le localStorage et redirige)
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userWhatsapp');
  window.location.href = 'login.html';
}

/**
 * Retourne l'objet utilisateur stocké dans le localStorage
 */
function getCurrentUser() {
  return {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
    whatsapp: localStorage.getItem('userWhatsapp'),
  };
}

/**
 * Redirige vers la page d'accueil correspondant au rôle
 */
function redirectByRole(role) {
  const pages = {
    admin: 'admin.html',
    delivery: 'livreur.html',
    customer: 'products.html',
  };
  window.location.href = pages[role] || 'login.html';
}

/**
 * Vérifie si l'utilisateur est connecté (retourne booléen sans rediriger)
 */
function isLoggedIn() {
  return !!localStorage.getItem('token');
}