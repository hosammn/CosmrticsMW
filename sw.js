// MW Cosmetics Service Worker
var CACHE_NAME = 'mw-cosmetics-v1';

// Install - cache the app shell
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Only cache same-origin requests
  if(e.request.url.indexOf('firestore') !== -1) return;
  if(e.request.url.indexOf('firebase') !== -1) return;
  
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Cache a copy of the response
        if(response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, copy);
          });
        }
        return response;
      })
      .catch(function() {
        // Fallback to cache if offline
        return caches.match(e.request);
      })
  );
});
