self.addEventListener("install", event => {
  event.waitUntil(caches.open(key).then(cache => cache.addAll(assets)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(name => (name.startsWith("cybergo-") || name.startsWith("cybernex-")) && name !== key).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET" || !assets.includes(url.pathname)) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.open(key).then(cache => cache.match("/"))));
    return;
  }
  event.respondWith(caches.open(key).then(cache => cache.match(event.request)).then(cached => cached ?? fetch(event.request)));
});
