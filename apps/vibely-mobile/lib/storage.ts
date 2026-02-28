import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local storage wrapper for mobile
 * Used for storing auth tokens, user preferences, etc.
 */

export const storage = {
  /**
   * Store a value
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error("Storage set error:", error);
      throw error;
    }
  },

  /**
   * Get a value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  /**
   * Remove a value
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
      throw error;
    }
  },
};

// Storage keys (constants for consistency)
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  GUEST_SESSION: "guest_session",
};