/* Voxelia service worker — offline play, background sync, push. */
const CACHE = 'voxelia-v4';
const SHELL = [
  './', './index.html', './voxelia.html', './manifest.json',
  './store.js', './rewards.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  // whichever way the music was uploaded, one of these will exist
  './audio/Home_Screen_music.ogg', './Home_Screen_music.wav',
  './audio/Grass_land_music.ogg', './Grass_land_music.wav',
  './audio/Land_music.ogg', './Land_music.wav',
  './audio/Other_planet.ogg', './Other_planet.wav',
  './audio/Space_blast_off_song.ogg', './Space_blast_off_song.wav',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
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
  if (req.url.includes('/rooms') || req.url.includes('/room?') ||
      req.url.includes('/visit') || req.url.includes('/claim') ||
      req.url.includes('/wallet') || req.url.startsWith('ws')) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) {
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
      }).catch(() => caches.match('./index.html'));
    })
  );
});

/* Background Sync: a claim made with no connection is sent once one returns. */
self.addEventListener('sync', (e) => {
  if (e.tag === 'voxelia-claims') {
    e.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true })
        .then((cs) => cs.forEach((c) => c.postMessage({ type: 'flush-claims' })))
    );
  }
});

/* Periodic Sync: keeps the room list warm so multiplayer opens instantly. */
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'voxelia-rooms') {
    e.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true })
        .then((cs) => cs.forEach((c) => c.postMessage({ type: 'refresh-rooms' })))
    );
  }
});

/* Push: an invitation to a friend's room, when you have granted permission. */
self.addEventListener('push', (e) => {
  let data = { title: 'Voxelia', body: 'A friend opened a room.' };
  try { if (e.data) data = Object.assign(data, e.data.json()); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './icon-192.png',
    badge: './monochrome-512.png',
    tag: 'voxelia',
    data: { url: data.url || './index.html' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      for (const c of cs) if ('focus' in c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
