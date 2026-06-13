// sw.js – Service Worker propre (corrige le cache + rend l'app installable)
//
// - Ne touche PAS aux requêtes externes (KkiaPay, Cloudflare, Socket.IO…)
// - Renvoie toujours une réponse valide (plus d'erreur "Failed to convert…")
// - Met en cache les pages pour le mode hors-ligne → bouton "Installer" actif
// - Nouveau nom de cache (v3) : l'ancien cache cassé est supprimé automatiquement

const CACHE_NAME = 'famille-fraicheur-v3';

const STATIC_ASSETS = [
  '/',
  '/login.html',
  '/register.html',
  '/products.html',
  '/account.html',
  '/livreur.html',
  '/admin.html',
  '/chat.html',
  '/conversations.html',
  '/forgot-password.html',
  '/reset-password.html',
  '/verify-email.html',
  '/css/style.css',
  '/manifest.json',
];

// Installation : mise en cache + activation immédiate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch((e) => console.warn('SW cache partiel', e)))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches + prise de contrôle immédiate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Stratégie réseau d'abord, repli cache
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;                                   // pas de POST/PUT
  if (new URL(request.url).origin !== self.location.origin) return;       // pas les domaines externes
  if (request.url.includes('/api/')) return;                             // pas l'API

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
        const cached = await caches.match(request);
        return cached || new Response('Hors ligne', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});

// Notifications push
self.addEventListener('push', (event) => {
  let data = { title: 'Famille & Fraîcheur', body: 'Nouvelle notification' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/icon-192.png',
      badge: '/images/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});