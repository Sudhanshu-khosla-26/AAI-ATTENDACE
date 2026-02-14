/**
 * AAI Attendance App - Storage Utility Functions
 * AsyncStorage wrapper with error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in AsyncStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {Promise<boolean>} True if successful
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Retrieved value or default
 */
export const getData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if successful
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise<boolean>} True if successful
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Get all keys in AsyncStorage
 * @returns {Promise<Array>} Array of keys
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/**
 * Check if key exists in AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if exists
 */
export const hasKey = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key ${key}:`, error);
    return false;
  }
};

/**
 * Merge data with existing data in AsyncStorage
 * @param {string} key - Storage key
 * @param {Object} value - Object to merge
 * @returns {Promise<boolean>} True if successful
 */
export const mergeData = async (key, value) => {
  try {
    const existingData = await getData(key, {});
    const mergedData = { ...existingData, ...value };
    return await storeData(key, mergedData);
  } catch (error) {
    console.error(`Error merging data for key ${key}:`, error);
    return false;
  }
};

/**
 * Append item to array in AsyncStorage
 * @param {string} key - Storage key
 * @param {*} item - Item to append
 * @returns {Promise<boolean>} True if successful
 */
export const appendToArray = async (key, item) => {
  try {
    const existingArray = await getData(key, []);
    if (!Array.isArray(existingArray)) {
      throw new Error('Existing data is not an array');
    }
    existingArray.push(item);
    return await storeData(key, existingArray);
  } catch (error) {
    console.error(`Error appending to array for key ${key}:`, error);
    return false;
  }
};

/**
 * Remove item from array in AsyncStorage by property
 * @param {string} key - Storage key
 * @param {string} property - Property to match
 * @param {*} value - Value to match
 * @returns {Promise<boolean>} True if successful
 */
export const removeFromArray = async (key, property, value) => {
  try {
    const existingArray = await getData(key, []);
    if (!Array.isArray(existingArray)) {
      throw new Error('Existing data is not an array');
    }
    const filteredArray = existingArray.filter(item => item[property] !== value);
    return await storeData(key, filteredArray);
  } catch (error) {
    console.error(`Error removing from array for key ${key}:`, error);
    return false;
  }
};

/**
 * Update item in array in AsyncStorage
 * @param {string} key - Storage key
 * @param {string} property - Property to match
 * @param {*} value - Value to match
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} True if successful
 */
export const updateInArray = async (key, property, value, updates) => {
  try {
    const existingArray = await getData(key, []);
    if (!Array.isArray(existingArray)) {
      throw new Error('Existing data is not an array');
    }
    const updatedArray = existingArray.map(item => {
      if (item[property] === value) {
        return { ...item, ...updates };
      }
      return item;
    });
    return await storeData(key, updatedArray);
  } catch (error) {
    console.error(`Error updating in array for key ${key}:`, error);
    return false;
  }
};

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage usage info
 */
export const getStorageInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    
    let totalSize = 0;
    const details = [];
    
    items.forEach(([key, value]) => {
      const size = value ? value.length * 2 : 0; // Approximate size in bytes (UTF-16)
      totalSize += size;
      details.push({
        key,
        size: formatBytes(size),
        sizeBytes: size,
      });
    });
    
    return {
      totalKeys: keys.length,
      totalSize: formatBytes(totalSize),
      totalSizeBytes: totalSize,
      details: details.sort((a, b) => b.sizeBytes - a.sizeBytes),
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalKeys: 0,
      totalSize: '0 B',
      totalSizeBytes: 0,
      details: [],
    };
  }
};

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Export all data to JSON
 * @returns {Promise<Object>} All stored data
 */
export const exportAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    
    const data = {};
    items.forEach(([key, value]) => {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error exporting all data:', error);
    return {};
  }
};

/**
 * Import data from JSON object
 * @param {Object} data - Data to import
 * @returns {Promise<boolean>} True if successful
 */
export const importData = async (data) => {
  try {
    const promises = Object.entries(data).map(([key, value]) => {
      return storeData(key, value);
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export default {
  storeData,
  getData,
  removeData,
  clearAllData,
  getAllKeys,
  hasKey,
  mergeData,
  appendToArray,
  removeFromArray,
  updateInArray,
  getStorageInfo,
  exportAllData,
  importData,
};
