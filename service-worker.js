const CACHE_NAME = 'money-tracker-cache-v1';
const urlsToCache = [
  './', // Caches the root URL, which resolves to index.html
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js' // Cache the html2canvas library too!
];

// Install event: Fires when the service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache during install:', error);
      })
  );
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.warn('Service Worker: Fetch failed:', event.request.url, error);
          });
      })
  );
});

// Activate event: Cleans up old caches to save space and ensure updates
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        self.clients.claim();
    })
  );
});