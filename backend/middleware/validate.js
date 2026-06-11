const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  handleValidationErrors,
];

const registerValidation = [
  body('name').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('role').isIn(['admin', 'delivery', 'customer']).withMessage('Rôle invalide'),
  handleValidationErrors,
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  handleValidationErrors,
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  handleValidationErrors,
];

const productValidation = [
  body('name').notEmpty().withMessage('Nom du produit requis'),
  body('price').isFloat({ gt: 0 }).withMessage('Prix doit être supérieur à 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock doit être un nombre positif ou zéro'),
  handleValidationErrors,
];

// ✅ transaction_code n'est plus exigé
const createOrderValidation = [
  body('address_id').notEmpty().withMessage('Adresse de livraison requise'),
  body('delivery_slot').notEmpty().withMessage('Créneau de livraison requis'),
  body('payment_phone').notEmpty().withMessage('Numéro de téléphone Mobile Money requis'),
  body('items').isArray({ min: 1 }).withMessage('Au moins un produit requis'),
  handleValidationErrors,
];

const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'confirmed', 'assigned', 'in_progress', 'delivered', 'cancelled', 'returned', 'pending_payment'])
    .withMessage('Statut invalide'),
  handleValidationErrors,
];

const sendMessageValidation = [
  body('order_id').notEmpty().withMessage('ID de commande requis'),
  body('content').notEmpty().withMessage('Message vide'),
  handleValidationErrors,
];

const addressValidation = [
  body('label').notEmpty().withMessage('Libellé requis'),
  body('full_address').notEmpty().withMessage('Adresse complète requise'),
  body('city').notEmpty().withMessage('Ville requise'),
  handleValidationErrors,
];

module.exports = {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  productValidation,
  createOrderValidation,
  updateOrderStatusValidation,
  sendMessageValidation,
  addressValidation,
};