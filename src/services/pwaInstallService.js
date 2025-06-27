// PWA Installation Service
class PWAInstallService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstallable = false;
    this.isInstalled = false;
    this.installButton = null;
    
    this.init();
  }

  init() {
    // Check if app is already installed
    this.checkInstallationStatus();
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('PWA: beforeinstallprompt event fired');
      
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Store the event so it can be triggered later
      this.deferredPrompt = event;
      this.isInstallable = true;
      
      // Show custom install button
      this.showInstallButton();
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installable', {
        detail: { canInstall: true }
      }));
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', (event) => {
      console.log('PWA: App was installed successfully');
      this.isInstalled = true;
      this.isInstallable = false;
      this.deferredPrompt = null;
      
      // Hide install button
      this.hideInstallButton();
      
      // Show success message
      this.showInstallSuccessMessage();
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-installed', {
        detail: { installed: true }
      }));
    });

    // Check for iOS Safari
    this.checkIOSInstallation();
  }

  checkInstallationStatus() {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA: App is running as installed PWA');
    }
  }

  checkIOSInstallation() {
    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone;
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS installation instructions
      this.showIOSInstallInstructions();
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: No deferred prompt available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`PWA: User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      return false;
    } finally {
      // Clear the deferred prompt
      this.deferredPrompt = null;
      this.isInstallable = false;
    }
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    if (!this.installButton) {
      this.installButton = this.createInstallButton();
    }
    
    // Show the button
    if (this.installButton) {
      this.installButton.style.display = 'block';
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'none';
    }
  }

  createInstallButton() {
    const button = document.createElement('button');
    button.className = 'pwa-install-button';
    button.innerHTML = `
      <span class="install-icon">📱</span>
      <span class="install-text">Install App</span>
    `;
    
    button.addEventListener('click', () => {
      this.installApp();
    });

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 15px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
        display: none;
        align-items: center;
        gap: 8px;
      }
      
      .pwa-install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
      
      .pwa-install-button .install-icon {
        font-size: 16px;
      }
      
      @media (max-width: 768px) {
        .pwa-install-button {
          bottom: 80px;
          right: 15px;
          padding: 12px 16px;
          font-size: 13px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(button);
    
    return button;
  }

  showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'pwa-install-success';
    message.innerHTML = `
      <div class="success-content">
        <span class="success-icon">✅</span>
        <span class="success-text">App berhasil diinstall!</span>
      </div>
    `;

    // Add CSS for success message
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-success {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
      }
      
      .success-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  showIOSInstallInstructions() {
    // Create iOS install instructions modal
    const modal = document.createElement('div');
    modal.className = 'ios-install-modal';
    modal.innerHTML = `
      <div class="ios-install-content">
        <h3>Install Story App</h3>
        <p>Untuk menginstall aplikasi di iOS:</p>
        <ol>
          <li>Tap tombol Share <span class="ios-icon">⬆️</span></li>
          <li>Scroll dan pilih "Add to Home Screen" <span class="ios-icon">➕</span></li>
          <li>Tap "Add" untuk menginstall</li>
        </ol>
        <button class="ios-close-btn" onclick="this.parentElement.parentElement.remove()">
          Mengerti
        </button>
      </div>
    `;

    // Add CSS for iOS modal
    const style = document.createElement('style');
    style.textContent = `
      .ios-install-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1002;
      }
      
      .ios-install-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 350px;
        margin: 20px;
        text-align: center;
      }
      
      .ios-install-content h3 {
        color: #2c3e50;
        margin-bottom: 15px;
      }
      
      .ios-install-content ol {
        text-align: left;
        margin: 20px 0;
      }
      
      .ios-install-content li {
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .ios-icon {
        font-size: 18px;
      }
      
      .ios-close-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 10000);
  }

  // Public methods
  canInstall() {
    return this.isInstallable;
  }

  isAppInstalled() {
    return this.isInstalled;
  }
}

// Create and export singleton instance
export const pwaInstallService = new PWAInstallService();
