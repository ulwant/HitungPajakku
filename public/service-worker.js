const CACHE_NAME = "pajak-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/index.css",
  "/favicon.svg",
  "/manifest.json",
  // add any static files you ship in /public you want cached
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: activate");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Cache-first for same-origin requests, network-first for API/navigation if needed
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // For navigation requests, try network first then fallback to cache/index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // put a copy in cache for offline use
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => {
          return caches.match("/index.html");
        })
    );
    return;
  }

  // For same-origin static assets -> cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkResponse) => {
            // we don't cache opaque responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === "opaque") {
              return networkResponse;
            }
            const respClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
            return networkResponse;
          })
          .catch(() => {
            // final fallback to index.html for navigation or a blank response
            if (request.headers.get("accept")?.includes("text/html")) {
              return caches.match("/index.html");
            }
            return new Response("", { status: 503, statusText: "Service Unavailable" });
          });
      })
    );
    return;
  }

  // For cross-origin requests just try network then fallback to cache if available
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
