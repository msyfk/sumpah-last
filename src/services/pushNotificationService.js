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

  // Check if push notifications are supported
  checkSupport() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  // Initialize service worker and push notifications
  async initialize() {
    if (!this.isSupported) {
      throw new Error("Push notifications are not supported in this browser");
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered successfully:", this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
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

  // Request notification permission
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

  // Subscribe to push notifications
  async subscribe() {
    if (!this.registration) {
      throw new Error("Service worker not registered");
    }

    try {
      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to push manager
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("Push subscription successful:", this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      return false;
    }

    try {
      const successful = await this.subscription.unsubscribe();

      if (successful) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscription);
        this.subscription = null;
      }

      return successful;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw error;
    }
  }

  // Send subscription to server
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
      console.log("Sending subscription to server...");
      const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        // If endpoint doesn't exist (404) or other server error, store locally
        console.log(
          `Push subscription endpoint returned ${response.status}, storing locally`
        );
        localStorage.setItem(
          "push_subscription",
          JSON.stringify(subscription.toJSON())
        );
        localStorage.setItem(
          "push_subscription_timestamp",
          Date.now().toString()
        );
        return;
      }

      const data = await response.json();
      console.log("Subscription sent to server successfully:", data);
      localStorage.setItem(
        "push_subscription",
        JSON.stringify(subscription.toJSON())
      );
      localStorage.setItem("push_subscription_server", "true");
      localStorage.setItem(
        "push_subscription_timestamp",
        Date.now().toString()
      );
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      // Store locally as fallback
      console.log("Storing subscription locally as fallback");
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

  // Remove subscription from server
  async removeSubscriptionFromServer(subscription) {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/push/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Subscription removed from server:", data);
      }
    } catch (error) {
      console.error("Error removing subscription from server:", error);
    } finally {
      // Remove from local storage
      localStorage.removeItem("push_subscription");
    }
  }

  // Get current subscription status
  async getSubscriptionStatus() {
    if (!this.registration) {
      return {
        isSubscribed: false,
        subscription: null,
        error: "Service worker not registered",
      };
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      const localSubscription = localStorage.getItem("push_subscription");
      const timestamp = localStorage.getItem("push_subscription_timestamp");
      const serverStored =
        localStorage.getItem("push_subscription_server") === "true";

      return {
        isSubscribed: !!this.subscription,
        subscription: this.subscription,
        localSubscription: localSubscription
          ? JSON.parse(localSubscription)
          : null,
        timestamp: timestamp ? new Date(parseInt(timestamp)) : null,
        serverStored: serverStored,
      };
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return {
        isSubscribed: false,
        subscription: null,
        error: error.message,
      };
    }
  }

  // Get subscription info for debugging
  getSubscriptionInfo() {
    const localSubscription = localStorage.getItem("push_subscription");
    const timestamp = localStorage.getItem("push_subscription_timestamp");
    const serverStored =
      localStorage.getItem("push_subscription_server") === "true";

    return {
      hasLocalSubscription: !!localSubscription,
      localSubscription: localSubscription
        ? JSON.parse(localSubscription)
        : null,
      timestamp: timestamp ? new Date(parseInt(timestamp)) : null,
      serverStored: serverStored,
      vapidPublicKey: VAPID_PUBLIC_KEY,
      isSupported: this.isSupported,
      registration: !!this.registration,
    };
  }

  // Utility function to convert VAPID key
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

  // Test notification
  async sendTestNotification() {
    if (!this.isSupported || Notification.permission !== "granted") {
      throw new Error("Notifications not supported or permission not granted");
    }

    const notification = new Notification("Story App Test", {
      body: "Push notification berhasil diaktifkan!",
      icon: "/vite.svg",
      badge: "/vite.svg",
      tag: "test-notification",
      requireInteraction: false,
      data: {
        url: "/",
        timestamp: Date.now(),
      },
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
