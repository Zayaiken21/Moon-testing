/* Voxelia service worker — offline play, background sync, push. */
const CACHE = 'voxelia-v23';
const SHELL = [
  './', './index.html', './voxelia.html', './manifest.json',
  './store.js', './rewards.js',
  './voxelia-avatars.js', './character-select.html', './character-select.css', './character-select.js',
  './voxelia-things.js', './models/things/manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  // whichever way the music was uploaded, one of these will exist
  './audio/Home_Screen_music.ogg', './audio/Home_Screen_music.mp3',
  './audio/Grass_land_music.ogg', './audio/Grass_land_music.mp3',
  './audio/Land_music.ogg', './audio/Land_music.mp3',
  './audio/Other_planet.ogg', './audio/Other_planet.mp3',
  './audio/Space_blast_off_song.ogg', './audio/Space_blast_off_song.mp3',
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

  /* Never come between the game and its server. */
  if (req.url.includes('/rooms') || req.url.includes('/room?') ||
      req.url.includes('/visit') || req.url.includes('/claim') ||
      req.url.includes('/health') || req.url.includes('/account') ||
      req.url.includes('/wallet') || req.url.startsWith('ws')) return;

  /* The game's own code: the newest wins.

     Everything used to be answered from the cache first, with a fresh copy
     fetched quietly for next time. That is right for a model or a piece of
     music, which never changes, and quite wrong for the game itself: every
     update landed one visit late, so a fix looked like it had not been made.
     A phone that had the game installed could sit two or three versions
     behind and there was no way for anybody to tell.

     Now the page and the scripts are asked for over the network first, with
     the cache kept up to date behind them and used the moment the network is
     not there — so an update shows up at once and the game still works with
     no connection at all. */
  const own = new URL(req.url).origin === self.location.origin;
  const code = own && /\.(html|js|css|json)$/i.test(new URL(req.url).pathname);
  const page = req.mode === 'navigate';

  if (code || page) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  /* Everything else — models, music, pictures — never changes, so the
     cached copy is the right answer and the fastest one. */
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
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
