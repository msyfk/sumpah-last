import { indexedDBService } from "../services/indexedDBService.js";
import { createLoadingIndicator } from "./LoadingIndicator.js";

/**
 * Create offline storage management component
 * @param {HTMLElement} parentElement - Parent element to render into
 * @param {Function} onStorageChange - Callback when storage changes
 * @returns {HTMLElement}
 */
export const createOfflineStorageManager = (parentElement, onStorageChange) => {
  const container = document.createElement("div");
  container.className = "offline-storage-manager";

  // Create header
  const header = document.createElement("div");
  header.className = "storage-header";
  header.innerHTML = `
    <h3>📱 Offline Storage Management</h3>
    <p class="storage-description">Manage your cached stories for offline viewing</p>
  `;
  container.appendChild(header);

  // Create storage stats section
  const statsSection = document.createElement("div");
  statsSection.className = "storage-stats";
  container.appendChild(statsSection);

  // Create actions section
  const actionsSection = document.createElement("div");
  actionsSection.className = "storage-actions";
  container.appendChild(actionsSection);

  // Create stories list section
  const storiesSection = document.createElement("div");
  storiesSection.className = "cached-stories-section";
  container.appendChild(storiesSection);

  // Load and display storage information
  loadStorageInfo();

  async function loadStorageInfo() {
    try {
      const loadingIndicator = createLoadingIndicator();
      statsSection.appendChild(loadingIndicator);

      const [stats, stories] = await Promise.all([
        indexedDBService.getStorageStats(),
        indexedDBService.getAllStories()
      ]);

      loadingIndicator.remove();

      // Display storage stats
      displayStorageStats(stats);
      
      // Display action buttons
      displayActionButtons();
      
      // Display cached stories
      displayCachedStories(stories);

    } catch (error) {
      console.error("Error loading storage info:", error);
      statsSection.innerHTML = `
        <div class="error-message">
          <p>❌ Error loading storage information</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
    }
  }

  function displayStorageStats(stats) {
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    statsSection.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${stats.totalStories}</div>
          <div class="stat-label">Cached Stories</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${formatSize(stats.estimatedSize)}</div>
          <div class="stat-label">Storage Used</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${formatDate(stats.newestCache)}</div>
          <div class="stat-label">Last Updated</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${formatDate(stats.oldestCache)}</div>
          <div class="stat-label">Oldest Cache</div>
        </div>
      </div>
    `;
  }

  function displayActionButtons() {
    actionsSection.innerHTML = `
      <div class="action-buttons">
        <button id="refresh-cache-btn" class="btn btn-primary">
          🔄 Refresh Cache
        </button>
        <button id="clear-all-btn" class="btn btn-danger">
          🗑️ Clear All Data
        </button>
        <button id="export-data-btn" class="btn btn-secondary">
          📤 Export Data
        </button>
      </div>
    `;

    // Add event listeners
    document.getElementById('refresh-cache-btn').addEventListener('click', handleRefreshCache);
    document.getElementById('clear-all-btn').addEventListener('click', handleClearAll);
    document.getElementById('export-data-btn').addEventListener('click', handleExportData);
  }

  function displayCachedStories(stories) {
    if (stories.length === 0) {
      storiesSection.innerHTML = `
        <div class="no-stories">
          <p>📭 No cached stories found</p>
          <p class="help-text">Stories will be automatically cached when you browse them online</p>
        </div>
      `;
      return;
    }

    const storiesHtml = `
      <div class="cached-stories-header">
        <h4>Cached Stories (${stories.length})</h4>
        <p class="help-text">Tap on a story to view details or delete individual items</p>
      </div>
      <div class="cached-stories-list">
        ${stories.map(story => createCachedStoryItem(story)).join('')}
      </div>
    `;

    storiesSection.innerHTML = storiesHtml;

    // Add event listeners for delete buttons
    stories.forEach(story => {
      const deleteBtn = document.getElementById(`delete-story-${story.id}`);
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteStory(story.id, story.name);
        });
      }

      // Add click listener for story item
      const storyItem = document.getElementById(`cached-story-${story.id}`);
      if (storyItem) {
        storyItem.addEventListener('click', () => {
          window.location.hash = `/stories/${story.id}`;
        });
      }
    });
  }

  function createCachedStoryItem(story) {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const isOfflineCreated = story.createdOffline || story.isOffline;
    const statusBadge = isOfflineCreated 
      ? '<span class="status-badge offline">📱 Created Offline</span>'
      : '<span class="status-badge cached">💾 Cached</span>';

    return `
      <div class="cached-story-item" id="cached-story-${story.id}">
        <div class="story-thumbnail">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy" 
               onerror="this.src='/offline-image.svg'">
        </div>
        <div class="story-info">
          <h5 class="story-title">${story.name}</h5>
          <p class="story-description">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
          <div class="story-meta">
            <span class="cache-date">Cached: ${formatDate(story.cachedAt)}</span>
            ${statusBadge}
          </div>
        </div>
        <div class="story-actions">
          <button id="delete-story-${story.id}" class="btn-icon delete-btn" 
                  title="Delete from cache" aria-label="Delete story from cache">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  async function handleRefreshCache() {
    const refreshBtn = document.getElementById('refresh-cache-btn');
    const originalText = refreshBtn.textContent;
    
    try {
      refreshBtn.textContent = '🔄 Refreshing...';
      refreshBtn.disabled = true;

      // Trigger cache refresh by calling the callback
      if (onStorageChange) {
        await onStorageChange('refresh');
      }

      // Reload storage info
      await loadStorageInfo();

      // Show success message
      showMessage('✅ Cache refreshed successfully', 'success');

    } catch (error) {
      console.error('Error refreshing cache:', error);
      showMessage('❌ Failed to refresh cache', 'error');
    } finally {
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      return;
    }

    const clearBtn = document.getElementById('clear-all-btn');
    const originalText = clearBtn.textContent;

    try {
      clearBtn.textContent = '🗑️ Clearing...';
      clearBtn.disabled = true;

      await indexedDBService.clearAllStories();

      // Trigger callback
      if (onStorageChange) {
        await onStorageChange('clear');
      }

      // Reload storage info
      await loadStorageInfo();

      showMessage('✅ All cached data cleared', 'success');

    } catch (error) {
      console.error('Error clearing cache:', error);
      showMessage('❌ Failed to clear cache', 'error');
    } finally {
      clearBtn.textContent = originalText;
      clearBtn.disabled = false;
    }
  }

  async function handleDeleteStory(storyId, storyName) {
    if (!confirm(`Delete "${storyName}" from cache?`)) {
      return;
    }

    try {
      await indexedDBService.deleteStory(storyId);

      // Trigger callback
      if (onStorageChange) {
        await onStorageChange('delete', storyId);
      }

      // Reload storage info
      await loadStorageInfo();

      showMessage('✅ Story deleted from cache', 'success');

    } catch (error) {
      console.error('Error deleting story:', error);
      showMessage('❌ Failed to delete story', 'error');
    }
  }

  async function handleExportData() {
    try {
      const stories = await indexedDBService.getAllStories();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalStories: stories.length,
        stories: stories
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `story-app-cache-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      showMessage('✅ Data exported successfully', 'success');

    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('❌ Failed to export data', 'error');
    }
  }

  function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    container.insertBefore(messageEl, container.firstChild);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  return container;
};
