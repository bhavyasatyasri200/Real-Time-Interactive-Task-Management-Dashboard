/**
 * Local Storage utility wrappers for persisting application state.
 * All operations are wrapped in try/catch to prevent app crashes on
 * corrupted data or storage quota exceeded errors.
 */

export const STORAGE_KEY = 'kanban_dashboard_tasks';

export const storage = {
  /**
   * Serialize and save data to localStorage under a given key.
   * @param {string} key - The localStorage key
   * @param {any} data - The data to serialize and persist
   */
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save state to Local Storage:', error);
    }
  },

  /**
   * Load and deserialize data from localStorage.
   * Falls back to the provided default if no data or parsing fails.
   * @param {string} key - The localStorage key
   * @param {any} fallback - Default value if nothing found or parse fails
   * @returns {any} The parsed data or fallback
   */
  load: (key, fallback = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error('Failed to load state from Local Storage, returning fallback:', error);
      return fallback;
    }
  },

  /**
   * Remove a key from localStorage.
   * @param {string} key - The localStorage key to clear
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove key from Local Storage:', error);
    }
  }
};
