// sw.js – Service Worker pour Famille & Fraîcheur
// Gère le cache et les notifications push

const CACHE_NAME = 'famille-fraicheur-v1';
const STATIC_ASSETS = [
  '/',
  '/login.html',
  '/products.html',
  '/account.html',
  '/livreur.html',
  '/admin.html',
  '/chat.html',
  '/conversations.html',
  '/forgot-password.html',
  '/reset-password.html',
  '/register.html',
  '/css/style.css',
  '/js/apiClient.js',
  '/js/authClient.js',
  '/js/cartClient.js',
  '/js/chatClient.js',
  '/js/mapClient.js',
  '/js/utilsClient.js',
  '/js/pwaClient.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://cdn.socket.io/4.8.0/socket.io.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// ======= Installation : mise en cache des fichiers statiques =======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: mise en cache des assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('SW: certains assets n\'ont pas pu être mis en cache', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ======= Activation : nettoyage des anciens caches =======
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ======= Stratégie de cache : Network first, puis cache =======
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;
  // Ignorer les API (elles ne doivent pas être en cache)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache une copie de la réponse si elle est valide
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, servir depuis le cache
        return caches.match(event.request);
      })
  );
});

// ======= Réception des notifications push =======
self.addEventListener('push', (event) => {
  let data = { title: 'Famille & Fraîcheur', body: 'Nouvelle notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ======= Clic sur une notification =======
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Si un onglet est déjà ouvert, focus et navigue
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});