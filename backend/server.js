// server.js – Point d'entrée du serveur HTTP avec Socket.io

const http = require('http');
const app = require('./app');
const socketHandler = require('./socket'); // index.js est chargé automatiquement

const PORT = process.env.PORT || 3000;

// Créer le serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Attacher Socket.io au serveur HTTP
socketHandler(server);

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});