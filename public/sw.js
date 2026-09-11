const CACHE = "reloj-btc-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/favicon.svg", "/poster.jpg", "/icon-180.png", "/icon-192.png", "/icon-512.png"]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/@") || url.pathname.includes("node_modules")) {
    return;
  }

  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(fetch(req).catch(() => caches.match("/icon-192.png").then(() => fetch(req))));
    return;
  }

  if (req.destination !== "image") return;

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
        }
        return res;
      });
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const w of windows) {
        if ("focus" in w) return w.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    }),
  );
});
