/*
  Service worker: serve solo a far funzionare l'app anche senza connessione.
  Salva in cache i file del progetto (immagini, codice). Non vede e non tocca
  nulla di ciò che viene digitato.
  QUANDO CARICHI FILE MODIFICATI SU GITHUB, AUMENTA QUESTO NUMERO (v1 → v2 → v3...).
*/
const VERSIONE = 'schermo-v2';
const FILE = [
  './', 'index.html', 'style.css', 'config.js', 'app.js', 'manifest.webmanifest',
  'img/wallpaper.jpg', 'img/home.jpg', 'img/widget1.png', 'img/widget2.png', 'img/widget3.png',
  'img/widget4.png', 'img/btn_torch.png', 'img/btn_camera.png', 'img/icon-180.png',
  'img/icon-192.png', 'img/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSIONE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((cached) => {
    const net = fetch(e.request).then((res) => {
      if (res && res.ok) { const copia = res.clone(); caches.open(VERSIONE).then((c) => c.put(e.request, copia)); }
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
