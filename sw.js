// AKVT Progressive Web App Service Worker (PWA)
const CACHE_NAME = 'akvt-pwa-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/css/adaptive.css',
  '/css/global.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Install: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for documents/pages, Cache-first for images/CSS/fonts
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET, cross-origin requests, or admin panel
  if (req.method !== 'GET' || !url.origin.includes(self.location.origin) || url.pathname.startsWith('/admin')) {
    return;
  }

  // Static assets (CSS, JS, images, icons, fonts) -> Cache-first with network fallback
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|woff2|woff|ttf|ico)$/) ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // HTML pages -> Network-first with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });
      })
  );
});
