const CACHE_NAME = 'jasmine-hub-v2';
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function putInCache(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
}

// Pages: try the network first so edits show up right away; fall back to
// the cache only when there's no connection.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    putInCache(request, response);
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Static assets (images, fonts, audio): serve from cache instantly, refresh
// in the background since these rarely change.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      putInCache(request, response);
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url.endsWith('.zip')) return; // never cache the big export archives

  const isPage = request.mode === 'navigate' || request.destination === '' || request.headers.get('accept')?.includes('text/html');

  event.respondWith(isPage ? networkFirst(request) : cacheFirst(request));
});
