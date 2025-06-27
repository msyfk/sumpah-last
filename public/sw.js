// Enhanced Service Worker for PWA with Complete Offline Support
const CACHE_NAME = "story-app-v2";
const STATIC_CACHE = "story-app-static-v2";
const DYNAMIC_CACHE = "story-app-dynamic-v2";
const IMAGE_CACHE = "story-app-images-v2";

// Application Shell - Critical resources for offline functionality
const SHELL_URLS = [
  "/",
  "/index.html",
  "/src/main.js",
  "/src/App.js",
  "/src/App.css",
  "/src/index.css",
  "/manifest.json",
  "/offline.html",
  "/offline-image.svg",
  "/src/components/Navbar.js",
  "/src/components/LoadingIndicator.js",
  "/src/pages/HomePage.js",
  "/src/pages/LoginPage.js",
  "/src/pages/RegisterPage.js",
  "/src/pages/AddStoryPage.js",
  "/src/pages/DetailStoryPage.js",
  "/src/pages/SettingsPage.js",
  "/src/utils/auth.js",
  "/src/services/authApi.js",
  "/src/services/storyApi.js",
  "/src/services/pushNotificationService.js",
];

// External resources
const EXTERNAL_URLS = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
];

// Offline fallback pages
const OFFLINE_FALLBACK_PAGE = "/offline.html";
const OFFLINE_FALLBACK_IMAGE = "/offline-image.svg";

// Install event - cache resources with different strategies
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event");
  event.waitUntil(
    Promise.all([
      // Cache application shell
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching application shell");
        return cache.addAll(SHELL_URLS);
      }),
      // Cache external resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching external resources");
        return Promise.allSettled(
          EXTERNAL_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      }),
    ])
      .then(() => {
        console.log("Service Worker: Skip waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Install failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");

  const expectedCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!expectedCaches.includes(cacheName)) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Claiming clients");
        return self.clients.claim();
      })
  );
});

// Enhanced Fetch event with different caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies
  if (request.method !== "GET") {
    return; // Only handle GET requests
  }

  // Strategy 1: Cache First for App Shell (static resources)
  if (
    SHELL_URLS.includes(url.pathname) ||
    EXTERNAL_URLS.includes(request.url)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (request.mode === "navigate") {
              return caches.match(OFFLINE_FALLBACK_PAGE);
            }
          });
      })
    );
    return;
  }

  // Strategy 2: Network First for API calls (dynamic content)
  if (url.hostname === "story-api.dicoding.dev") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline message for API failures
            return new Response(
              JSON.stringify({
                error: true,
                message:
                  "Tidak dapat terhubung ke server. Menampilkan data offline.",
              }),
              {
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Strategy 3: Cache First for Images
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(OFFLINE_FALLBACK_IMAGE);
          });
      })
    );
    return;
  }

  // Strategy 4: Network First for other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_FALLBACK_PAGE);
          }
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event received", event);

  let notificationData = {
    title: "Story App",
    body: "Ada cerita baru untuk Anda!",
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "story-notification",
    requireInteraction: false,
    actions: [
      {
        action: "view",
        title: "Lihat Cerita",
        icon: "/vite.svg",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
    data: {
      url: "/",
      timestamp: Date.now(),
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (error) {
      console.log("Service Worker: Error parsing push data", error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      timestamp: notificationData.data.timestamp,
    })
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (optional - for offline functionality)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync event", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks here
      console.log("Service Worker: Performing background sync")
    );
  }
});

// Message event - communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
