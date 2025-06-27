// Test script untuk push notification
// Jalankan di browser console untuk testing

console.log('=== Push Notification Test Script ===');

// Test 1: Check browser support
console.log('\n1. Browser Support Check:');
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);
console.log('Notification API:', 'Notification' in window);
console.log('Notification Permission:', typeof Notification !== 'undefined' ? Notification.permission : 'N/A');

// Test 2: Check service worker registration
console.log('\n2. Service Worker Check:');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Registered Service Workers:', registrations.length);
    registrations.forEach((registration, index) => {
      console.log(`SW ${index + 1}:`, registration.scope);
      console.log(`SW ${index + 1} State:`, registration.active ? registration.active.state : 'No active worker');
    });
  });
}

// Test 3: Check push subscription
console.log('\n3. Push Subscription Check:');
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.pushManager.getSubscription();
  }).then(subscription => {
    console.log('Current Subscription:', subscription ? 'Active' : 'None');
    if (subscription) {
      console.log('Endpoint:', subscription.endpoint);
      console.log('Keys:', subscription.toJSON().keys);
    }
  }).catch(error => {
    console.error('Error checking subscription:', error);
  });
}

// Test 4: Check local storage
console.log('\n4. Local Storage Check:');
const localSub = localStorage.getItem('push_subscription');
const timestamp = localStorage.getItem('push_subscription_timestamp');
const serverStored = localStorage.getItem('push_subscription_server');

console.log('Local Subscription:', localSub ? 'Exists' : 'None');
console.log('Timestamp:', timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'None');
console.log('Server Stored:', serverStored === 'true' ? 'Yes' : 'No');

// Test 5: Test notification permission
console.log('\n5. Notification Permission Test:');
if ('Notification' in window) {
  console.log('Current Permission:', Notification.permission);
  
  if (Notification.permission === 'granted') {
    console.log('✅ Notifications are allowed');
    
    // Test notification
    const testNotification = () => {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from the console',
        icon: '/vite.svg',
        tag: 'test-console'
      });
      
      notification.onclick = () => {
        console.log('Test notification clicked');
        notification.close();
      };
      
      setTimeout(() => {
        notification.close();
      }, 5000);
    };
    
    console.log('Run testNotification() to send a test notification');
    window.testNotification = testNotification;
  } else if (Notification.permission === 'default') {
    console.log('⚠️ Permission not requested yet');
    
    const requestPermission = () => {
      Notification.requestPermission().then(permission => {
        console.log('Permission result:', permission);
      });
    };
    
    console.log('Run requestPermission() to request notification permission');
    window.requestPermission = requestPermission;
  } else {
    console.log('❌ Notifications are blocked');
  }
}

// Test 6: VAPID key validation
console.log('\n6. VAPID Key Validation:');
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

try {
  const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  console.log('VAPID Key Length:', vapidKey.length);
  console.log('VAPID Key Valid:', vapidKey.length === 65 ? '✅ Yes' : '❌ No');
} catch (error) {
  console.error('VAPID Key Error:', error);
}

// Test 7: Service worker messaging
console.log('\n7. Service Worker Messaging Test:');
if ('serviceWorker' in navigator) {
  const testSWMessage = () => {
    navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        registration.active.postMessage({
          type: 'TEST_MESSAGE',
          data: 'Hello from console'
        });
        console.log('Message sent to service worker');
      } else {
        console.log('No active service worker');
      }
    });
  };
  
  console.log('Run testSWMessage() to test service worker messaging');
  window.testSWMessage = testSWMessage;
}

console.log('\n=== Test Script Loaded ===');
console.log('Available functions:');
if (typeof window.testNotification === 'function') console.log('- testNotification()');
if (typeof window.requestPermission === 'function') console.log('- requestPermission()');
if (typeof window.testSWMessage === 'function') console.log('- testSWMessage()');
