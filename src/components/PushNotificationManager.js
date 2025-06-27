// Push Notification Manager Component
import { pushNotificationService } from '../services/pushNotificationService.js';

export const createPushNotificationManager = () => {
  const container = document.createElement('div');
  container.className = 'push-notification-manager';
  
  // Create notification status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'notification-status';
  
  const statusIcon = document.createElement('span');
  statusIcon.className = 'status-icon';
  
  const statusText = document.createElement('span');
  statusText.className = 'status-text';
  
  statusIndicator.appendChild(statusIcon);
  statusIndicator.appendChild(statusText);
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'notification-toggle-btn';
  toggleButton.type = 'button';
  
  // Create info text
  const infoText = document.createElement('p');
  infoText.className = 'notification-info';
  infoText.textContent = 'Aktifkan notifikasi untuk mendapatkan update cerita terbaru';
  
  // Assemble component
  container.appendChild(statusIndicator);
  container.appendChild(infoText);
  container.appendChild(toggleButton);
  
  // State management
  let isSubscribed = false;
  let isLoading = false;
  
  // Update UI based on subscription status
  const updateUI = (subscribed, loading = false) => {
    isSubscribed = subscribed;
    isLoading = loading;
    
    if (loading) {
      statusIcon.textContent = '⏳';
      statusText.textContent = 'Memproses...';
      toggleButton.textContent = 'Memproses...';
      toggleButton.disabled = true;
      return;
    }
    
    if (subscribed) {
      statusIcon.textContent = '🔔';
      statusText.textContent = 'Notifikasi Aktif';
      toggleButton.textContent = 'Matikan Notifikasi';
      toggleButton.className = 'notification-toggle-btn active';
      infoText.textContent = 'Anda akan menerima notifikasi untuk cerita baru';
    } else {
      statusIcon.textContent = '🔕';
      statusText.textContent = 'Notifikasi Tidak Aktif';
      toggleButton.textContent = 'Aktifkan Notifikasi';
      toggleButton.className = 'notification-toggle-btn';
      infoText.textContent = 'Aktifkan notifikasi untuk mendapatkan update cerita terbaru';
    }
    
    toggleButton.disabled = false;
  };
  
  // Handle toggle button click
  const handleToggle = async () => {
    if (isLoading) return;
    
    try {
      updateUI(isSubscribed, true);
      
      if (isSubscribed) {
        // Unsubscribe
        await pushNotificationService.unsubscribe();
        updateUI(false);
        showMessage('Notifikasi berhasil dimatikan', 'success');
      } else {
        // Check if notifications are supported
        if (!pushNotificationService.isSupported) {
          showMessage('Browser Anda tidak mendukung push notification', 'error');
          updateUI(false);
          return;
        }
        
        // Request permission
        await pushNotificationService.requestPermission();
        
        // Initialize service worker if not already done
        if (!pushNotificationService.registration) {
          await pushNotificationService.initialize();
        }
        
        // Subscribe
        await pushNotificationService.subscribe();
        updateUI(true);
        
        // Send test notification
        setTimeout(async () => {
          try {
            await pushNotificationService.sendTestNotification();
          } catch (error) {
            console.log('Test notification failed:', error);
          }
        }, 1000);
        
        showMessage('Notifikasi berhasil diaktifkan!', 'success');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      updateUI(isSubscribed);
      
      let errorMessage = 'Gagal mengubah pengaturan notifikasi';
      if (error.message.includes('permission')) {
        errorMessage = 'Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.';
      } else if (error.message.includes('not supported')) {
        errorMessage = 'Browser Anda tidak mendukung push notification';
      }
      
      showMessage(errorMessage, 'error');
    }
  };
  
  // Show message to user
  const showMessage = (message, type = 'info') => {
    // Remove existing message
    const existingMessage = container.querySelector('.notification-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `notification-message ${type}`;
    messageElement.textContent = message;
    
    container.appendChild(messageElement);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  };
  
  // Initialize component
  const initialize = async () => {
    try {
      updateUI(false, true);
      
      if (pushNotificationService.isSupported) {
        // Initialize service worker
        await pushNotificationService.initialize();
        
        // Check current subscription status
        const status = await pushNotificationService.getSubscriptionStatus();
        updateUI(status.isSubscribed);
      } else {
        updateUI(false);
        showMessage('Browser Anda tidak mendukung push notification', 'warning');
        toggleButton.disabled = true;
      }
    } catch (error) {
      console.error('Error initializing push notification manager:', error);
      updateUI(false);
    }
  };
  
  // Add event listener
  toggleButton.addEventListener('click', handleToggle);
  
  // Initialize when component is created
  setTimeout(initialize, 100);
  
  return {
    element: container,
    updateStatus: updateUI,
    initialize: initialize
  };
};

// CSS styles for the component (to be added to CSS file)
export const pushNotificationStyles = `
.push-notification-manager {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notification-status {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
}

.status-icon {
  font-size: 1.2em;
  margin-right: 8px;
}

.status-text {
  color: #333;
}

.notification-info {
  color: #666;
  font-size: 0.9em;
  margin: 10px 0;
  line-height: 1.4;
}

.notification-toggle-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
}

.notification-toggle-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.notification-toggle-btn.active {
  background: #e74c3c;
}

.notification-toggle-btn.active:hover:not(:disabled) {
  background: #c0392b;
}

.notification-toggle-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.notification-message {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9em;
}

.notification-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification-message.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.notification-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

@media (max-width: 768px) {
  .push-notification-manager {
    margin: 10px 0;
    padding: 15px;
  }
  
  .notification-toggle-btn {
    max-width: none;
  }
}
`;
