import { getAllStories, getStoryDetail } from "../services/storyApi.js";
import { indexedDBService } from "../services/indexedDBService.js";

/**
 * Enhanced Story Model with offline capabilities
 * Handles both online API calls and offline IndexedDB storage
 */
export class OfflineStoryModel {
  constructor() {
    this.stories = [];
    this.isOnline = navigator.onLine;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is now online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is now offline');
    });
  }

  /**
   * Get all stories with offline fallback
   * @param {boolean} forceRefresh - Force refresh from API even if cache is valid
   * @returns {Promise<Array>}
   */
  async getStories(forceRefresh = false) {
    try {
      // Try to get fresh data from API if online
      if (this.isOnline && (forceRefresh || await this.shouldRefreshCache())) {
        console.log('Fetching stories from API...');
        const apiStories = await getAllStories();
        
        // Cache the stories to IndexedDB
        await this.cacheStories(apiStories);
        
        this.stories = apiStories;
        return this.stories;
      }
      
      // Fallback to cached data
      console.log('Loading stories from cache...');
      const cachedStories = await indexedDBService.getAllStories();
      
      if (cachedStories.length > 0) {
        this.stories = cachedStories;
        return this.stories;
      }
      
      // If no cached data and offline, return empty array
      if (!this.isOnline) {
        console.log('No cached stories available and app is offline');
        this.stories = [];
        return this.stories;
      }
      
      // Last resort: try API call even if we think we're offline
      console.log('Attempting API call as last resort...');
      const apiStories = await getAllStories();
      await this.cacheStories(apiStories);
      this.stories = apiStories;
      return this.stories;
      
    } catch (error) {
      console.error("Error in OfflineStoryModel.getStories:", error);
      
      // Try to load from cache on error
      try {
        const cachedStories = await indexedDBService.getAllStories();
        if (cachedStories.length > 0) {
          console.log('Loaded stories from cache after API error');
          this.stories = cachedStories;
          return this.stories;
        }
      } catch (cacheError) {
        console.error("Error loading from cache:", cacheError);
      }
      
      throw error;
    }
  }

  /**
   * Get a specific story by ID with offline fallback
   * @param {string} storyId - Story ID to retrieve
   * @returns {Promise<Object>}
   */
  async getStoryById(storyId) {
    try {
      // Try API first if online
      if (this.isOnline) {
        console.log(`Fetching story ${storyId} from API...`);
        const apiStory = await getStoryDetail(storyId);
        
        // Cache the individual story
        await indexedDBService.storeStory(apiStory);
        
        return apiStory;
      }
      
      // Fallback to cached data
      console.log(`Loading story ${storyId} from cache...`);
      const cachedStory = await indexedDBService.getStory(storyId);
      
      if (cachedStory) {
        return cachedStory;
      }
      
      throw new Error('Story not found in cache and app is offline');
      
    } catch (error) {
      console.error(`Error getting story ${storyId}:`, error);
      
      // Try cache as fallback
      try {
        const cachedStory = await indexedDBService.getStory(storyId);
        if (cachedStory) {
          console.log(`Loaded story ${storyId} from cache after API error`);
          return cachedStory;
        }
      } catch (cacheError) {
        console.error("Error loading story from cache:", cacheError);
      }
      
      throw error;
    }
  }

  /**
   * Cache stories to IndexedDB
   * @param {Array} stories - Stories to cache
   * @returns {Promise<void>}
   */
  async cacheStories(stories) {
    try {
      await indexedDBService.storeStories(stories);
      console.log(`Cached ${stories.length} stories to IndexedDB`);
    } catch (error) {
      console.error('Error caching stories:', error);
      // Don't throw error - caching failure shouldn't break the app
    }
  }

  /**
   * Check if cache should be refreshed
   * @returns {Promise<boolean>}
   */
  async shouldRefreshCache() {
    try {
      const stats = await indexedDBService.getStorageStats();
      
      if (stats.totalStories === 0) {
        return true; // No cache, should refresh
      }
      
      if (!stats.newestCache) {
        return true; // Invalid cache data
      }
      
      const cacheAge = Date.now() - new Date(stats.newestCache).getTime();
      return cacheAge > this.cacheExpiry;
      
    } catch (error) {
      console.error('Error checking cache freshness:', error);
      return true; // On error, assume cache should be refreshed
    }
  }

  /**
   * Get cached stories only (for offline management)
   * @returns {Promise<Array>}
   */
  async getCachedStories() {
    try {
      return await indexedDBService.getAllStories();
    } catch (error) {
      console.error('Error getting cached stories:', error);
      return [];
    }
  }

  /**
   * Delete a cached story
   * @param {string} storyId - Story ID to delete
   * @returns {Promise<void>}
   */
  async deleteCachedStory(storyId) {
    try {
      await indexedDBService.deleteStory(storyId);
      
      // Update local stories array
      this.stories = this.stories.filter(story => story.id !== storyId);
      
      console.log(`Deleted cached story ${storyId}`);
    } catch (error) {
      console.error(`Error deleting cached story ${storyId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cached stories
   * @returns {Promise<void>}
   */
  async clearAllCachedStories() {
    try {
      await indexedDBService.clearAllStories();
      this.stories = [];
      console.log('Cleared all cached stories');
    } catch (error) {
      console.error('Error clearing cached stories:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>}
   */
  async getStorageStats() {
    try {
      return await indexedDBService.getStorageStats();
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalStories: 0,
        oldestCache: null,
        newestCache: null,
        estimatedSize: 0
      };
    }
  }

  /**
   * Check if app is currently online
   * @returns {boolean}
   */
  isAppOnline() {
    return this.isOnline;
  }

  /**
   * Force refresh stories from API
   * @returns {Promise<Array>}
   */
  async refreshStories() {
    return await this.getStories(true);
  }

  /**
   * Add a story to offline storage (for stories created offline)
   * @param {Object} story - Story object to store
   * @returns {Promise<void>}
   */
  async addOfflineStory(story) {
    try {
      const offlineStory = {
        ...story,
        isOffline: true,
        createdOffline: true,
        cachedAt: new Date().toISOString()
      };
      
      await indexedDBService.storeStory(offlineStory);
      this.stories.unshift(offlineStory); // Add to beginning of array
      
      console.log('Added offline story to cache');
    } catch (error) {
      console.error('Error adding offline story:', error);
      throw error;
    }
  }

  /**
   * Get stories that were created offline
   * @returns {Promise<Array>}
   */
  async getOfflineCreatedStories() {
    try {
      const allCached = await indexedDBService.getAllStories();
      return allCached.filter(story => story.createdOffline === true);
    } catch (error) {
      console.error('Error getting offline created stories:', error);
      return [];
    }
  }
}
