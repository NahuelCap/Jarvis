// Jarvis – service worker
// Cambiá el número de VERSION cada vez que subas una actualización de la app.
const VERSION = 'jarvis-v1';
const SHELL = ['./', './index.html', './manifest.json', './fondo.jpg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase, Google y fuentes externas: siempre directo a internet
  if (url.origin !== self.location.origin) return;

  // Páginas: primero internet (para tener siempre la última versión), si no hay conexión usa la copia
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Resto de archivos propios: copia guardada y si no, internet
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
