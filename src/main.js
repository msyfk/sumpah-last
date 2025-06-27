import { App } from "./App.js";
import { pushNotificationService } from "./services/pushNotificationService.js";
import { pwaInstallService } from "./services/pwaInstallService.js";
import { indexedDBService } from "./services/indexedDBService.js";
import "./index.css";

document.addEventListener("DOMContentLoaded", async () => {
  const appContainer = document.getElementById("root");
  App.init(appContainer);

  // Initialize push notification service
  try {
    if (pushNotificationService.isSupported) {
      console.log("Initializing push notification service...");
      await pushNotificationService.initialize();
      console.log("Push notification service initialized successfully");
    } else {
      console.log("Push notifications not supported in this browser");
    }
  } catch (error) {
    console.error("Failed to initialize push notification service:", error);
  }

  // Initialize IndexedDB service
  try {
    if (indexedDBService.constructor.isSupported()) {
      console.log("Initializing IndexedDB service...");
      await indexedDBService.init();
      console.log("IndexedDB service initialized successfully");
    } else {
      console.log("IndexedDB not supported in this browser");
    }
  } catch (error) {
    console.error("Failed to initialize IndexedDB service:", error);
  }

  // Initialize PWA install service
  console.log("PWA install service initialized");

  // Listen for PWA events
  window.addEventListener("pwa-installable", (event) => {
    console.log("PWA is installable:", event.detail);
  });

  window.addEventListener("pwa-installed", (event) => {
    console.log("PWA was installed:", event.detail);
  });
});
