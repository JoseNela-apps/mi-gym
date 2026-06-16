/* Mi Guía de Gym — Service Worker
   Cachea la app para que funcione sin internet en el gym.
   Sube ESTE archivo a la raíz del repo junto a index.html. */
const CACHE = "migym-v6";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Nunca cachear las llamadas a la base de datos de Firebase (deben ir a la red)
  if (req.url.indexOf("firebaseio.com") >= 0 || req.url.indexOf("identitytoolkit") >= 0 || req.url.indexOf("googleapis.com") >= 0) return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy).catch(() => {}));
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
