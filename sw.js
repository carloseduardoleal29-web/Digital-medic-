// Digital Médic Official Service Worker (PWA Offline & Instant Launcher)
const CACHE_NAME = 'digital-medic-pwa-v7';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/digital_medic_logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA Service Worker] Precache asset warning (safe to ignore):', err);
      });
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass API routes, WebSocket connections, and dynamic generated PDFs
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/ws') || url.pathname.startsWith('/pdf')) {
    return;
  }

  // Handle HTML navigation requests (app startup from home screen or browser tab)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              cache.put('/', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(event.request);
          if (cachedNavigate) return cachedNavigate;
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;

          return new Response(
            `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><title>Digital Médic</title><style>body{background:#082846;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;box-sizing:border-box}h1{font-size:22px;margin:0 0 10px}p{font-size:14px;color:#94a3b8;margin:0 0 20px}button{background:#2563eb;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer}</style></head><body><h1>Digital Médic</h1><p>Conectando con su consultorio médico...</p><button onclick="window.location.reload()">Reintentar conexión</button><script>window.addEventListener('online',()=>window.location.reload());setTimeout(()=>window.location.reload(),3000);</script></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Handle all other static assets (scripts, styles, icons, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update in background (Stale While Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('', { status: 408, statusText: 'Request timed out' });
        });
    })
  );
});
