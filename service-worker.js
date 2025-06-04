const CACHE_NAME = 'money-tracker-cache-v1';
const urlsToCache = [
  './', // Caches the root URL, which resolves to index.html
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png', // Ensure these paths are correct
  './icons/icon-512x512.png'  // Ensure these paths are correct
];

// Install event: Fires when the service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(urlsToCache); // Add all listed URLs to the cache
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache during install:', error);
      })
  );
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Try to find the request in the cache
      .then(response => {
        // If resource is in cache, return it
        if (response) {
          return response;
        }
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Optional: Cache new requests as they come in (read-through caching)
            // Ensure we don't cache non-GET requests or partial responses
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(error => {
            // This catch handles network errors, e.g., if offline and not in cache
            console.warn('Service Worker: Fetch failed:', event.request.url, error);
            // You could return an offline page here if you had one
            // return caches.match('/offline.html');
          });
      })
  );
});

// Activate event: Cleans up old caches to save space and ensure updates
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    }).then(() => {
        // Ensure that the service worker takes control of clients immediately
        self.clients.claim();
    })
  );
});