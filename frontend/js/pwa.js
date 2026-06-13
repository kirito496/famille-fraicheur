// pwa.js – Enregistrement du Service Worker (version simplifiée et propre)
// On enregistre juste le service worker. Les notifications push (qui
// nécessitent une clé VAPID configurée côté serveur) sont désactivées pour
// l'instant afin d'éviter les erreurs dans la console.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré :', registration.scope);
      })
      .catch((err) => {
        console.error('❌ Erreur enregistrement Service Worker :', err);
      });
  });
} else {
  console.warn('Service Worker non supporté par ce navigateur');
}