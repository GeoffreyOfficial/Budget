/* Carnet — Service Worker
   Rôle : rendre l'appli disponible hors-ligne et accélérer le démarrage.
   Il ne touche JAMAIS à tes données : celles-ci vivent dans localStorage,
   pas dans ce cache. Vider ce cache ne supprime pas ton budget. */

const CACHE = "budget-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

// Installation : on met en cache la coquille de l'appli.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches d'une version précédente.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Requêtes : "network-first" pour le document (on récupère la dernière version
// si le réseau répond), sinon on retombe sur le cache (hors-ligne).
// Pour les icônes/manifest : "cache-first" (rapide, ça ne change pas).
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // On ne gère que notre propre origine ; les scripts et l'API Google
  // (accounts.google.com, googleapis.com) passent directement par le réseau.
  if (new URL(req.url).origin !== self.location.origin) return;

  const isDoc = req.mode === "navigate" ||
                (req.headers.get("accept") || "").includes("text/html");

  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
