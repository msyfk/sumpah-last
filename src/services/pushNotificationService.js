// Push Notification Service
import { getToken } from "../utils/auth.js";

// VAPID Public Key dari Dicoding Story API
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
const API_BASE_URL = "https://story-api.dicoding.dev/v1";

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  async initialize() {
    if (!this.isSupported) {
      throw new Error("Push notifications are not supported in this browser");
    }
    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered successfully:", this.registration);
      await navigator.serviceWorker.ready;
      this.subscription = await this.registration.pushManager.getSubscription();
      return {
        registration: this.registration,
        subscription: this.subscription,
        isSubscribed: !!this.subscription,
      };
    } catch (error) {
      console.error("Error initializing push notifications:", error);
      throw error;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error("Push notifications are not supported");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }
    return permission;
  }

  async subscribe() {
    if (!this.registration) {
      throw new Error("Service worker not registered");
    }
    try {
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
      console.log("Push subscription successful:", this.subscription);
      await this.sendSubscriptionToServer(this.subscription);
      return this.subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      return false;
    }
    try {
      // Panggil fungsi untuk hapus dari server SEBELUM unsubscribe dari browser
      await this.removeSubscriptionFromServer(this.subscription);

      const successful = await this.subscription.unsubscribe();
      if (successful) {
        this.subscription = null;
        console.log("Successfully unsubscribed from browser.");
      }
      return successful;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    const token = getToken();
    if (!token) {
      console.warn("User not authenticated, storing subscription locally");
      localStorage.setItem(
        "push_subscription",
        JSON.stringify(subscription.toJSON())
      );
      return;
    }
    try {
      const subData = subscription.toJSON();
      const requestBody = {
        endpoint: subData.endpoint,
        keys: subData.keys,
      };
      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server responded with ${response.status}: ${
            errorData.message || "Bad Request"
          }`
        );
      }
      const data = await response.json();
      console.log("Subscription sent to server successfully:", data);
      localStorage.setItem("push_subscription_server", "true");
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      localStorage.setItem(
        "push_subscription",
        JSON.stringify(subscription.toJSON())
      );
      localStorage.setItem(
        "push_subscription_timestamp",
        Date.now().toString()
      );
    }
  }

  async removeSubscriptionFromServer(subscription) {
    const token = getToken();
    if (!token) {
      console.warn("No token found, cannot remove subscription from server.");
      return;
    }
    try {
      console.log(
        "Removing subscription with POST method (DELETE override)..."
      );

      const requestBody = {
        endpoint: subscription.endpoint,
        // PERBAIKAN: Tambahkan _method untuk memberi tahu server ini adalah operasi DELETE
        _method: "DELETE",
      };

      const response = await fetch(
        `${API_BASE_URL}/notifications/unsubscribe`,
        {
          // PERBAIKAN: Gunakan metode POST
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        console.log("Subscription removed successfully from server.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          `Failed to remove subscription. Status: ${response.status}`,
          errorData
        );
      }
    } catch (error) {
      console.error("Error during removeSubscriptionFromServer:", error);
    } finally {
      localStorage.removeItem("push_subscription");
      localStorage.removeItem("push_subscription_server");
      localStorage.removeItem("push_subscription_timestamp");
    }
  }

  async getSubscriptionStatus() {
    if (!this.registration) {
      return { isSubscribed: false };
    }
    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return { isSubscribed: !!this.subscription };
    } catch (error) {
      return { isSubscribed: false, error: error.message };
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendTestNotification() {
    if (!this.isSupported || Notification.permission !== "granted") {
      throw new Error("Notifications not supported or permission not granted");
    }
    const notification = new Notification("Story App Test", {
      body: "Push notification berhasil diaktifkan!",
      icon: "/vite.svg",
    });
    setTimeout(() => notification.close(), 5000);
  }
}

export const pushNotificationService = new PushNotificationService();
