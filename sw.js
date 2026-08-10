/* sw.js — Service worker de Carnet Budget (PWA sur GitHub Pages)
 *
 * Stratégie « network-first » pour la page :
 *   - EN LIGNE  : chaque chargement/refresh récupère la DERNIÈRE version déployée
 *                 (puis en garde une copie de secours).
 *   - HORS LIGNE: on sert la dernière copie mise en cache.
 *
 * C'est ce qui règle le problème « j'ai mis à jour index.html mais le refresh ne
 * change rien » : l'ancienne stratégie renvoyait la page depuis le cache.
 *
 * Astuce : quand tu déploies une mise à jour, tu n'as RIEN à changer ici. Le simple
 * fait d'ouvrir l'appli en ligne récupère la nouvelle page. (Modifier la valeur de
 * CACHE ci-dessous force juste un grand nettoyage du cache — facultatif.)
 */
const CACHE = "carnet-budget-v2";
const APP_SHELL = "./index.html";

self.addEventListener("install", (e) => {
  // Précharge la coquille pour le mode hors-ligne et prend la main sans attendre.
  e.waitUntil(caches.open(CACHE).then((c) => c.add(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // Supprime les anciens caches (versions précédentes).
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                    // POST/PUT (ex. Google Drive) -> réseau direct
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // cross-origin (googleapis, gstatic…) -> réseau direct

  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // NETWORK-FIRST : la page renvoyée est toujours la plus récente si tu es en ligne.
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(APP_SHELL, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match(APP_SHELL)) || (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Autres ressources same-origin (manifest, icônes…) : cache d'abord,
  // puis rafraîchissement en arrière-plan (stale-while-revalidate).
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req)
      .then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      })
      .catch(() => cached);
    return cached || network;
  })());
});
