// sw.js – Service Worker pour Famille & Fraîcheur
// Gère le cache et les notifications push

const CACHE_NAME = 'famille-fraicheur-v2'; // ⬅️ version augmentée pour forcer la mise à jour

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
  '/manifest.json',
];

// ======= Installation : mise en cache des fichiers statiques =======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: mise en cache des assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('SW: certains assets non mis en cache', err);
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
  const request = event.request;

  // 1. Ne gérer que les requêtes GET
  if (request.method !== 'GET') return;

  // 2. NE PAS intercepter les requêtes vers d'autres domaines
  //    (KkiaPay, Cloudflare, Socket.IO, Leaflet, etc.).
  //    On laisse le navigateur les gérer normalement.
  //    >> C'est ce qui corrige l'erreur "Failed to convert value to 'Response'".
  if (new URL(request.url).origin !== self.location.origin) return;

  // 3. Ne pas mettre les API en cache
  if (request.url.includes('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        // En cas d'échec réseau : servir depuis le cache,
        // et TOUJOURS renvoyer une Response valide (jamais undefined).
        const cached = await caches.match(request);
        return cached || new Response('Hors ligne', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
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
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ======= Clic sur une notification =======
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});