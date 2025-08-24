// ButtonStudio Service Worker v1.0
// Enables offline functionality and PWA features

const CACHE_NAME = "buttonstudio-v1";
const urlsToCache = [
  "/",
  "/styles.css",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/apple-touch-icon.svg",
  "/favicon.ico",
];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()), // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME && cacheName.startsWith("buttonstudio-")
          ) {
            console.log("🗑️ Removing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => self.clients.claim()), // Take control immediately
  );
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API requests (let them go to network)
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("generativelanguage.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (
            !response || response.status !== 200 || response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache same-origin resources
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      }),
  );
});

// Handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Background sync for offline transcriptions (future feature)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transcriptions") {
    event.waitUntil(syncTranscriptions());
  }
});

async function syncTranscriptions() {
  // Future: Sync offline transcriptions when back online
  console.log("📤 Syncing offline transcriptions...");
}
