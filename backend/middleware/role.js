// role.js – Vérification des rôles (admin, delivery, customer)

/**
 * Middleware de restriction par rôle(s)
 * @param  {...string} roles  Liste des rôles autorisés
 * @returns {Function}        Middleware Express
 * 
 * Usage : router.get('/admin', authMiddleware, role('admin'), (req, res) => {...})
 */
function role(...roles) {
  return (req, res, next) => {
    // req.user doit avoir été défini par authMiddleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit. Rôle insuffisant.' });
    }
    next();
  };
}

module.exports = role;