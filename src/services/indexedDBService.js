/**
 * IndexedDB Service for Story App
 * Provides offline storage capabilities for stories and user data
 */

class IndexedDBService {
  constructor() {
    this.dbName = 'StoryAppDB';
    this.dbVersion = 1;
    this.db = null;
    
    // Object store names
    this.stores = {
      STORIES: 'stories',
      USER_DATA: 'userData',
      SETTINGS: 'settings'
    };
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stories object store
        if (!db.objectStoreNames.contains(this.stores.STORIES)) {
          const storiesStore = db.createObjectStore(this.stores.STORIES, {
            keyPath: 'id'
          });
          
          // Create indexes for better querying
          storiesStore.createIndex('createdAt', 'createdAt', { unique: false });
          storiesStore.createIndex('name', 'name', { unique: false });
          storiesStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        // Create user data object store
        if (!db.objectStoreNames.contains(this.stores.USER_DATA)) {
          db.createObjectStore(this.stores.USER_DATA, {
            keyPath: 'key'
          });
        }

        // Create settings object store
        if (!db.objectStoreNames.contains(this.stores.SETTINGS)) {
          db.createObjectStore(this.stores.SETTINGS, {
            keyPath: 'key'
          });
        }

        console.log('IndexedDB schema created/updated');
      };
    });
  }

  /**
   * Store a single story in IndexedDB
   * @param {Object} story - Story object to store
   * @returns {Promise<void>}
   */
  async storeStory(story) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readwrite');
      const store = transaction.objectStore(this.stores.STORIES);
      
      // Add cached timestamp
      const storyWithCache = {
        ...story,
        cachedAt: new Date().toISOString(),
        isOffline: false
      };
      
      const request = store.put(storyWithCache);
      
      request.onsuccess = () => {
        console.log(`Story ${story.id} stored successfully`);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to store story: ${request.error}`));
      };
    });
  }

  /**
   * Store multiple stories in IndexedDB
   * @param {Array} stories - Array of story objects
   * @returns {Promise<void>}
   */
  async storeStories(stories) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readwrite');
      const store = transaction.objectStore(this.stores.STORIES);
      
      let completed = 0;
      const total = stories.length;
      
      if (total === 0) {
        resolve();
        return;
      }
      
      stories.forEach(story => {
        const storyWithCache = {
          ...story,
          cachedAt: new Date().toISOString(),
          isOffline: false
        };
        
        const request = store.put(storyWithCache);
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log(`${total} stories stored successfully`);
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to store story ${story.id}: ${request.error}`));
        };
      });
    });
  }

  /**
   * Retrieve all stories from IndexedDB
   * @returns {Promise<Array>}
   */
  async getAllStories() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readonly');
      const store = transaction.objectStore(this.stores.STORIES);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result || [];
        console.log(`Retrieved ${stories.length} stories from IndexedDB`);
        resolve(stories);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to retrieve stories: ${request.error}`));
      };
    });
  }

  /**
   * Retrieve a specific story by ID
   * @param {string} storyId - Story ID to retrieve
   * @returns {Promise<Object|null>}
   */
  async getStory(storyId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readonly');
      const store = transaction.objectStore(this.stores.STORIES);
      const request = store.get(storyId);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to retrieve story: ${request.error}`));
      };
    });
  }

  /**
   * Delete a specific story from IndexedDB
   * @param {string} storyId - Story ID to delete
   * @returns {Promise<void>}
   */
  async deleteStory(storyId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readwrite');
      const store = transaction.objectStore(this.stores.STORIES);
      const request = store.delete(storyId);
      
      request.onsuccess = () => {
        console.log(`Story ${storyId} deleted successfully`);
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to delete story: ${request.error}`));
      };
    });
  }

  /**
   * Clear all stories from IndexedDB
   * @returns {Promise<void>}
   */
  async clearAllStories() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readwrite');
      const store = transaction.objectStore(this.stores.STORIES);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('All stories cleared from IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to clear stories: ${request.error}`));
      };
    });
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>}
   */
  async getStorageStats() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.STORIES], 'readonly');
      const store = transaction.objectStore(this.stores.STORIES);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result || [];
        const stats = {
          totalStories: stories.length,
          oldestCache: null,
          newestCache: null,
          estimatedSize: 0
        };
        
        if (stories.length > 0) {
          const cacheDates = stories.map(s => new Date(s.cachedAt)).sort();
          stats.oldestCache = cacheDates[0].toISOString();
          stats.newestCache = cacheDates[cacheDates.length - 1].toISOString();
          
          // Rough size estimation (in bytes)
          stats.estimatedSize = JSON.stringify(stories).length;
        }
        
        resolve(stats);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get storage stats: ${request.error}`));
      };
    });
  }

  /**
   * Check if IndexedDB is supported
   * @returns {boolean}
   */
  static isSupported() {
    return 'indexedDB' in window;
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('IndexedDB connection closed');
    }
  }
}

// Create and export singleton instance
export const indexedDBService = new IndexedDBService();
