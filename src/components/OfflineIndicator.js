/**
 * Create offline status indicator component
 * @param {HTMLElement} parentElement - Parent element to render into
 * @returns {Object} - Component with update methods
 */
export const createOfflineIndicator = (parentElement) => {
  const indicator = document.createElement("div");
  indicator.className = "offline-indicator";
  indicator.setAttribute("role", "status");
  indicator.setAttribute("aria-live", "polite");

  let currentStatus = {
    isOnline: navigator.onLine,
    isUsingCache: false,
    lastUpdate: null
  };

  // Initialize indicator
  updateIndicator();

  // Listen for online/offline events
  window.addEventListener('online', () => {
    currentStatus.isOnline = true;
    updateIndicator();
  });

  window.addEventListener('offline', () => {
    currentStatus.isOnline = false;
    currentStatus.isUsingCache = true;
    updateIndicator();
  });

  function updateIndicator() {
    const { isOnline, isUsingCache, lastUpdate } = currentStatus;
    
    // Clear existing content
    indicator.innerHTML = '';
    
    // Remove all status classes
    indicator.classList.remove('online', 'offline', 'cache', 'hidden');

    if (!isOnline) {
      // Offline mode
      indicator.classList.add('offline');
      indicator.innerHTML = `
        <div class="indicator-content">
          <span class="indicator-icon">📱</span>
          <span class="indicator-text">Offline Mode</span>
          <span class="indicator-subtext">Using cached data</span>
        </div>
      `;
    } else if (isUsingCache) {
      // Online but using cache
      indicator.classList.add('cache');
      indicator.innerHTML = `
        <div class="indicator-content">
          <span class="indicator-icon">💾</span>
          <span class="indicator-text">Using Cache</span>
          <span class="indicator-subtext">Data may not be current</span>
        </div>
      `;
    } else {
      // Online with fresh data
      indicator.classList.add('online');
      const updateText = lastUpdate 
        ? `Updated ${formatTimeAgo(lastUpdate)}`
        : 'Connected';
      
      indicator.innerHTML = `
        <div class="indicator-content">
          <span class="indicator-icon">🌐</span>
          <span class="indicator-text">Online</span>
          <span class="indicator-subtext">${updateText}</span>
        </div>
      `;
    }

    // Add to parent if not already added
    if (!indicator.parentElement) {
      parentElement.appendChild(indicator);
    }
  }

  function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // Public API
  return {
    /**
     * Update the indicator status
     * @param {Object} status - Status object
     * @param {boolean} status.isOnline - Whether app is online
     * @param {boolean} status.isUsingCache - Whether using cached data
     * @param {Date} status.lastUpdate - Last update timestamp
     */
    updateStatus(status) {
      currentStatus = { ...currentStatus, ...status };
      updateIndicator();
    },

    /**
     * Set cache status
     * @param {boolean} usingCache - Whether using cache
     */
    setUsingCache(usingCache) {
      currentStatus.isUsingCache = usingCache;
      updateIndicator();
    },

    /**
     * Set last update time
     * @param {Date} date - Update timestamp
     */
    setLastUpdate(date) {
      currentStatus.lastUpdate = date;
      updateIndicator();
    },

    /**
     * Show the indicator
     */
    show() {
      indicator.classList.remove('hidden');
    },

    /**
     * Hide the indicator
     */
    hide() {
      indicator.classList.add('hidden');
    },

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
      return { ...currentStatus };
    },

    /**
     * Remove the indicator
     */
    destroy() {
      if (indicator.parentElement) {
        indicator.parentElement.removeChild(indicator);
      }
    }
  };
};

/**
 * Create a simple cache badge for story items
 * @param {boolean} isFromCache - Whether the story is from cache
 * @param {boolean} isOfflineCreated - Whether the story was created offline
 * @returns {HTMLElement}
 */
export const createCacheBadge = (isFromCache, isOfflineCreated = false) => {
  const badge = document.createElement("span");
  badge.className = "cache-badge";

  if (isOfflineCreated) {
    badge.classList.add("offline-created");
    badge.innerHTML = `
      <span class="badge-icon">📱</span>
      <span class="badge-text">Offline</span>
    `;
    badge.title = "Created while offline";
  } else if (isFromCache) {
    badge.classList.add("cached");
    badge.innerHTML = `
      <span class="badge-icon">💾</span>
      <span class="badge-text">Cached</span>
    `;
    badge.title = "Loaded from cache";
  } else {
    badge.classList.add("live");
    badge.innerHTML = `
      <span class="badge-icon">🌐</span>
      <span class="badge-text">Live</span>
    `;
    badge.title = "Fresh from server";
  }

  return badge;
};

/**
 * Create a connection status toast
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, warning, error)
 * @returns {HTMLElement}
 */
export const createConnectionToast = (message, type = 'info') => {
  const toast = document.createElement("div");
  toast.className = `connection-toast ${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }, 3000);

  return toast;
};

/**
 * Show a connection status toast
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 */
export const showConnectionToast = (message, type = 'info') => {
  const toast = createConnectionToast(message, type);
  
  // Find or create toast container
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
};
