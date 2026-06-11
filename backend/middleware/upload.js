const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dossier où seront enregistrées les images (à la racine du projet, dans frontend/images/offers)
    const dest = path.join(__dirname, '..', '..', 'frontend', 'images', 'offers');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Nom unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'offer-' + uniqueSuffix + ext);
  }
});

// Filtrer uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou GIF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

module.exports = upload;