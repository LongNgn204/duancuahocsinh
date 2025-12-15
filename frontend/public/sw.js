// frontend/public/sw.js
// Service Worker cho offline support và caching
// Chú thích: Lightweight service worker cho PWA features

const CACHE_NAME = 'ban-dong-hanh-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache install failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches và clear storage
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Xóa tất cả cache cũ
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.includes(APP_VERSION))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Thông báo cho tất cả clients để clear storage
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CLEAR_STORAGE',
            version: APP_VERSION,
          });
        });
      }),
    ])
  );
  self.clients.claim();
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Static assets: Cache First
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // API requests: Network First với fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (response.ok && request.method === 'GET') {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'offline', message: 'Không có kết nối mạng' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // HTML pages: Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Default: Network only
  event.respondWith(fetch(request));
});
