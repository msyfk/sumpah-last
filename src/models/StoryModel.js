import { getAllStories } from "../services/storyApi.js";
import { indexedDBService } from "../services/indexedDBService.js";

export class StoryModel {
  constructor() {
    this.stories = [];
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  async getStories() {
    try {
      // Try to get from API first
      if (this.isOnline) {
        try {
          this.stories = await getAllStories();

          // Cache stories to IndexedDB for offline use
          await this.cacheStories(this.stories);

          return this.stories;
        } catch (apiError) {
          console.warn("API call failed, trying cache:", apiError.message);
          // Fall through to cache retrieval
        }
      }

      // Try to get from cache (either offline or API failed)
      const cachedStories = await indexedDBService.getAllStories();
      if (cachedStories.length > 0) {
        this.stories = cachedStories;
        console.log(`Loaded ${cachedStories.length} stories from cache`);
        return this.stories;
      }

      // If no cache and offline, return empty array
      if (!this.isOnline) {
        this.stories = [];
        return this.stories;
      }

      // Last resort: re-throw the original API error
      throw new Error("Unable to load stories from API or cache");
    } catch (error) {
      console.error("Error in StoryModel.getStories:", error);
      throw error;
    }
  }

  /**
   * Cache stories to IndexedDB
   * @param {Array} stories - Stories to cache
   */
  async cacheStories(stories) {
    try {
      await indexedDBService.storeStories(stories);
    } catch (error) {
      console.error("Error caching stories:", error);
      // Don't throw - caching failure shouldn't break the app
    }
  }

  /**
   * Check if currently using cached data
   * @returns {boolean}
   */
  isUsingCache() {
    return (
      !this.isOnline || (this.stories.length > 0 && this.stories[0].cachedAt)
    );
  }
}
