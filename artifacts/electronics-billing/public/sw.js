const CACHE_NAME = 'circuit-billing-v1';

function isApiRequest(url) {
  const scopePath = new URL(self.registration.scope).pathname;
  return url.pathname.startsWith(`${scopePath}api/`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(new URL(self.registration.scope).toString());
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('circuit-billing-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const rawUrl of event.data.urls) {
        try {
          const url = new URL(rawUrl, self.registration.scope);
          if (url.origin !== self.location.origin || isApiRequest(url)) continue;
          const response = await fetch(url);
          if (response.ok && response.type === 'basic') {
            await cache.put(url, response);
          }
        } catch {
          // Skip assets that cannot be fetched; the rest of the offline shell still works.
        }
      }
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || isApiRequest(url)) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await caches.match(new URL(self.registration.scope).toString());
          if (shell) return shell;
        }
        return Response.error();
      }
    })(),
  );
});
