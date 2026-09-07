/* Voxelia service worker — makes the game playable with no connection.
   Everything is cached on the first visit, then served from the device. */
const CACHE = 'voxelia-v1';
const SHELL = [
  './',
  './voxelia.html',
  './index.html',
  './store.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // a missing optional file must not sink the whole install
      Promise.all(SHELL.map((url) => c.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // multiplayer must always go to the network; everything else can come from disk
  if (req.url.includes('/rooms') || req.url.includes('/room?') || req.url.startsWith('ws')) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) {
        // refresh it quietly in the background for next time
        fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }).catch(() => {});
        return hit;
      }
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./voxelia.html'));
    })
  );
});
