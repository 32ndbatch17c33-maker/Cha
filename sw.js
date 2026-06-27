const CACHE_NAME = 'eunwoo-ai-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap'
];

// Install Service Worker and Cache Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker and Clear Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network First, falling back to Cache for API/External images
self.addEventListener('fetch', (event) => {
  // If it's the external text generation API, try network first, do not fallback to cache
  if (event.request.url.includes('pollinations.ai')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone the response to store in cache dynamically if needed
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache standard app files or static CDNs
          if (!event.request.url.includes('pollinations.ai')) {
            cache.put(event.request, responseToCache);
          }
        });
        return response;
      })
      .catch(() => {
        // If offline, return the cached version
        return caches.match(event.request);
      })
  );
});
