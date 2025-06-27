// Settings Page - Push Notification Settings and Offline Storage Management
import { createPushNotificationManager } from "../components/PushNotificationManager.js";
import { createOfflineStorageManager } from "../components/OfflineStorageManager.js";
import { pushNotificationService } from "../services/pushNotificationService.js";
import { indexedDBService } from "../services/indexedDBService.js";
import { getToken } from "../utils/auth.js";

export const renderSettingsPage = (parentElement) => {
  // Clear parent element
  parentElement.innerHTML = "";
  parentElement.setAttribute("aria-labelledby", "settings-heading");

  // Create main container
  const container = document.createElement("div");
  container.className = "container";
  parentElement.appendChild(container);

  // Page heading
  const heading = document.createElement("h2");
  heading.id = "settings-heading";
  heading.textContent = "Pengaturan";
  container.appendChild(heading);

  // Check if user is logged in
  const token = getToken();
  if (!token) {
    const loginMessage = document.createElement("div");
    loginMessage.className = "info-message";
    loginMessage.innerHTML = `
      <p>Anda harus login untuk mengakses pengaturan.</p>
      <p><a href="#/login">Klik di sini untuk login</a></p>
    `;
    container.appendChild(loginMessage);
    return;
  }

  // Settings sections
  const settingsContainer = document.createElement("div");
  settingsContainer.className = "settings-container";
  container.appendChild(settingsContainer);

  // Push Notification Section
  const notificationSection = document.createElement("section");
  notificationSection.className = "settings-section";
  notificationSection.innerHTML = `
    <h3>Push Notification</h3>
    <p>Kelola pengaturan notifikasi untuk mendapatkan update cerita terbaru.</p>
  `;
  settingsContainer.appendChild(notificationSection);

  // Add push notification manager
  const pushNotificationManager = createPushNotificationManager();
  notificationSection.appendChild(pushNotificationManager.element);

  // Offline Storage Section
  const storageSection = document.createElement("section");
  storageSection.className = "settings-section";
  storageSection.innerHTML = `
    <h3>Offline Storage</h3>
    <p>Kelola data yang tersimpan untuk penggunaan offline.</p>
  `;
  settingsContainer.appendChild(storageSection);

  // Add offline storage manager
  const handleStorageChange = async (action, data) => {
    console.log("Storage changed:", action, data);
    // You can add additional logic here if needed
  };

  const offlineStorageManager = createOfflineStorageManager(
    storageSection,
    handleStorageChange
  );
  storageSection.appendChild(offlineStorageManager);

  // Account Section
  const accountSection = document.createElement("section");
  accountSection.className = "settings-section";
  accountSection.innerHTML = `
    <h3>Akun</h3>
    <p>Informasi akun Anda.</p>
    <div class="account-info">
      <p><strong>Status:</strong> Anda sedang login</p>
      <p><strong>Token:</strong> ${token.substring(0, 20)}...</p>
    </div>
  `;
  settingsContainer.appendChild(accountSection);

  // App Info Section
  const appInfoSection = document.createElement("section");
  appInfoSection.className = "settings-section";
  appInfoSection.innerHTML = `
    <h3>Informasi Aplikasi</h3>
    <div class="app-info">
      <p><strong>Nama:</strong> Story App</p>
      <p><strong>Versi:</strong> 1.0.0</p>
      <p><strong>Fitur:</strong></p>
      <ul>
        <li>✅ Berbagi cerita dengan foto</li>
        <li>✅ Lokasi GPS</li>
        <li>✅ Peta interaktif</li>
        <li>✅ Push notification</li>
        <li>✅ Progressive Web App (PWA)</li>
        <li>✅ Offline storage dengan IndexedDB</li>
      </ul>
    </div>
  `;
  settingsContainer.appendChild(appInfoSection);

  // Browser Support Section
  const supportSection = document.createElement("section");
  supportSection.className = "settings-section";
  supportSection.innerHTML = `
    <h3>Dukungan Browser</h3>
    <div class="browser-support">
      <p><strong>Service Worker:</strong> ${
        "serviceWorker" in navigator ? "✅ Didukung" : "❌ Tidak didukung"
      }</p>
      <p><strong>Push Manager:</strong> ${
        "PushManager" in window ? "✅ Didukung" : "❌ Tidak didukung"
      }</p>
      <p><strong>Notification API:</strong> ${
        "Notification" in window ? "✅ Didukung" : "❌ Tidak didukung"
      }</p>
      <p><strong>Notification Permission:</strong> ${
        typeof Notification !== "undefined" ? Notification.permission : "N/A"
      }</p>
      <p><strong>Geolocation:</strong> ${
        "geolocation" in navigator ? "✅ Didukung" : "❌ Tidak didukung"
      }</p>
      <p><strong>Camera API:</strong> ${
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
          ? "✅ Didukung"
          : "❌ Tidak didukung"
      }</p>
      <p><strong>IndexedDB:</strong> ${
        indexedDBService.constructor.isSupported()
          ? "✅ Didukung"
          : "❌ Tidak didukung"
      }</p>
    </div>
  `;
  settingsContainer.appendChild(supportSection);

  // Debug Section (only show if push notification service is available)
  if (pushNotificationService.isSupported) {
    const debugSection = document.createElement("section");
    debugSection.className = "settings-section";
    debugSection.innerHTML = `
      <h3>Debug Information</h3>
      <div class="debug-info">
        <button id="refresh-debug" class="btn-secondary">Refresh Debug Info</button>
        <div id="debug-content">
          <p>Loading debug information...</p>
        </div>
      </div>
    `;
    settingsContainer.appendChild(debugSection);

    // Add debug refresh functionality
    const refreshButton = debugSection.querySelector("#refresh-debug");
    const debugContent = debugSection.querySelector("#debug-content");

    const updateDebugInfo = async () => {
      try {
        const info = pushNotificationService.getSubscriptionInfo();
        const status = await pushNotificationService.getSubscriptionStatus();

        debugContent.innerHTML = `
          <div class="debug-item">
            <strong>Service Supported:</strong> ${
              info.isSupported ? "Yes" : "No"
            }
          </div>
          <div class="debug-item">
            <strong>Service Worker Registered:</strong> ${
              info.registration ? "Yes" : "No"
            }
          </div>
          <div class="debug-item">
            <strong>Currently Subscribed:</strong> ${
              status.isSubscribed ? "Yes" : "No"
            }
          </div>
          <div class="debug-item">
            <strong>Local Subscription:</strong> ${
              info.hasLocalSubscription ? "Yes" : "No"
            }
          </div>
          <div class="debug-item">
            <strong>Server Stored:</strong> ${info.serverStored ? "Yes" : "No"}
          </div>
          <div class="debug-item">
            <strong>Subscription Timestamp:</strong> ${
              info.timestamp ? info.timestamp.toLocaleString() : "N/A"
            }
          </div>
          <div class="debug-item">
            <strong>VAPID Public Key:</strong> ${info.vapidPublicKey.substring(
              0,
              20
            )}...
          </div>
          ${
            status.error
              ? `<div class="debug-item error"><strong>Error:</strong> ${status.error}</div>`
              : ""
          }
        `;
      } catch (error) {
        debugContent.innerHTML = `<div class="debug-item error"><strong>Error:</strong> ${error.message}</div>`;
      }
    };

    refreshButton.addEventListener("click", updateDebugInfo);

    // Initial load
    setTimeout(updateDebugInfo, 500);
  }

  // Add CSS styles for settings page
  addSettingsStyles();
};

// Add CSS styles for settings page
const addSettingsStyles = () => {
  const styleId = "settings-page-styles";
  if (document.getElementById(styleId)) {
    return; // Styles already added
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .settings-section {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .settings-section h3 {
      color: #2c3e50;
      font-size: 1.4em;
      margin-top: 0;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .settings-section p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .account-info,
    .app-info,
    .browser-support,
    .debug-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }

    .app-info ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .app-info li {
      margin: 5px 0;
      color: #555;
    }

    .browser-support p {
      margin: 8px 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .debug-item {
      margin: 8px 0;
      padding: 5px 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .debug-item.error {
      color: #e74c3c;
      font-weight: bold;
    }

    #refresh-debug {
      margin-bottom: 15px;
    }

    @media (max-width: 768px) {
      .settings-section {
        padding: 20px;
        margin-bottom: 15px;
      }

      .settings-section h3 {
        font-size: 1.2em;
      }
    }
  `;
  document.head.appendChild(style);
};
