// pwa.js – Enregistrement du Service Worker et gestion des notifications push

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker non supporté par ce navigateur');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré :', registration.scope);
        // Demander la permission pour les notifications push
        requestNotificationPermission(registration);
      })
      .catch((err) => {
        console.error('❌ Erreur enregistrement Service Worker :', err);
      });
  });
}

function requestNotificationPermission(registration) {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées');
    return;
  }

  if (Notification.permission === 'granted') {
    // Déjà autorisé, souscrire aux notifications push
    subscribeToPush(registration);
  } else if (Notification.permission !== 'denied') {
    // Demander la permission
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        subscribeToPush(registration);
      }
    });
  }
}

function subscribeToPush(registration) {
  // Générer une clé VAPID côté serveur (à configurer plus tard)
  // Pour l'instant, on active juste les notifications du SW
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      // Clé publique VAPID placeholder – à remplacer par la vôtre
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
    )
  })
  .then((subscription) => {
    console.log('🔔 Abonné aux notifications push');
    // Ici on pourrait envoyer l'objet subscription au serveur pour l'enregistrer
    // fetch('/api/push/subscribe', { method:'POST', body: JSON.stringify(subscription) })
  })
  .catch((err) => {
    console.warn('❌ Erreur abonnement push :', err);
  });
}

// Utilitaire : convertir une clé VAPID base64 en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Lancer l'enregistrement au chargement de toute page
registerServiceWorker();