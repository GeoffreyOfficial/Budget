/* sw.js — Service worker de Carnet Budget (PWA sur GitHub Pages)
 *
 * Objectif : qu'un simple refresh EN LIGNE montre TOUJOURS la dernière version déployée.
 *
 * Points clés (par rapport à une version « cache-first » classique qui bloquait les MAJ) :
 *   - La page (HTML) est récupérée en réseau avec `cache: "no-store"` : on court-circuite le
 *     cache HTTP du navigateur ET le cache du SW, donc jamais d'ancienne page tant qu'on est en ligne.
 *   - Repli hors-ligne : si le réseau échoue, on sert la dernière copie mise en cache.
 *   - `skipWaiting()` + `clients.claim()` : le nouveau worker prend la main tout de suite.
 *   - Les anciens caches (versions précédentes) sont supprimés à l'activation.
 *
 * Tu n'as rien à modifier ici à chaque déploiement. (Changer CACHE force juste un nettoyage.)
 */
const CACHE = "carnet-budget-v3";
const APP_SHELL = "./index.html";

self.addEventListener("install", (e) => {
  // Précharge la coquille pour le hors-ligne (version fraîche), puis prend la main sans attendre.
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      fetch(APP_SHELL, { cache: "no-store" }).then((r) => c.put(APP_SHELL, r)).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                    // POST/PUT (Google Drive…) -> réseau direct
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // cross-origin (googleapis, gstatic…) -> direct

  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // NETWORK-FIRST + no-store : toujours la page la plus récente en ligne, repli cache hors-ligne.
    e.respondWith((async () => {
      try {
        const fresh = await fetch(url.pathname.endsWith("/") ? APP_SHELL : req.url, { cache: "no-store" });
        const c = await caches.open(CACHE);
        c.put(APP_SHELL, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match(APP_SHELL)) || (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Autres ressources same-origin (manifest, icônes…) : cache d'abord, mise à jour en fond.
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req)
      .then((res) => { if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone())); return res; })
      .catch(() => cached);
    return cached || network;
  })());
});

// Permet à la page de demander une bascule immédiate (bouton « Forcer la mise à jour »).
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
