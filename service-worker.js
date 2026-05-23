const CACHE_NAME = "ncut-ai-notice-v1";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./announcement.txt",
  "./announcement.en.txt",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/ncut-logo.svg",
  "./assets/pwa-icon.svg",
  "./assets/maskable-icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/maskable-icon-512.png",
  "./assets/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseCopy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy)).catch(() => {}));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
  );
});
