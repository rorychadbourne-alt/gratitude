// public/sw.js
// Service Worker for Push Notifications

const CACHE_NAME = 'gratitude-app-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Time for your daily gratitude reflection! 🙏',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'daily-gratitude',
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Write Gratitude',
        icon: '/action-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/dismiss-icon.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  // If push data exists, use it
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.title = data.title || 'Daily Gratitude';
      options.data = { ...options.data, ...data };
    } catch (e) {
      console.error('Error parsing push data:', e);
      options.title = 'Daily Gratitude';
    }
  } else {
    options.title = 'Daily Gratitude';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            return client;
          }
        }
        // Open new window if not already open
        return clients.openWindow(data.url || '/');
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Optional: Track notification dismissal
  // You could send analytics data here
});