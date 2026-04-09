const CACHE_NAME = "chat-app-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html"
];

// INSTALL → cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching files...");
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVATE → remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// FETCH → smart caching + Socket.IO fix
self.addEventListener("fetch", (event) => {
  // 🚨 VERY IMPORTANT: Skip Socket.IO requests
  if (event.request.url.includes("socket.io")) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Else fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Optional: cache new files dynamically
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
      })
      .catch(() => {
        // If offline and request fails → show offline page
        return caches.match("/offline.html");
      })
  );
});