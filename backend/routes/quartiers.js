const express = require('express');
const router = express.Router();
const quartiers = require('../data/quartiers.json');

// GET /api/quartiers
// Retourne la liste des quartiers regroupés par commune (Calavi, Cotonou)
router.get('/', (req, res) => {
  res.json(quartiers);
});

module.exports = router;