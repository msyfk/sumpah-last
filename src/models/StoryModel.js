import { getAllStories } from "../services/storyApi.js";
import { indexedDBService } from "../services/indexedDBService.js";

export class StoryModel {
  constructor() {
    this.stories = [];
    this.isOnline = navigator.onLine;
    this.usingCache = false;

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  async getStories() {
    this.usingCache = false;
    try {
      if (this.isOnline) {
        try {
          this.stories = await getAllStories();
          return this.stories;
        } catch (apiError) {
          console.warn("Failed to load from API, trying cache:", apiError.message);
        }
      }

      const cachedStories = await indexedDBService.getAllStories();
      if (cachedStories.length > 0) {
        this.stories = cachedStories;
        this.usingCache = true;
        console.log(`Loaded ${cachedStories.length} stories from cache`);
        return this.stories;
      }

      if (!this.isOnline) {
        this.stories = [];
        return this.stories;
      }

      throw new Error("Unable to load stories from API or cache");
    } catch (error) {
      console.error("Error in StoryModel.getStories:", error);
      throw error;
    }
  }

  /**
   * Check if currently using cached data
   * @returns {boolean}
   */
  isUsingCache() {
    return this.usingCache;
  }
}
