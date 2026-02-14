/**
 * AAI Attendance App - Location Service
 * Handles workplace location and geofence management
 */

import { STORAGE_KEYS } from '../constants/config';
import { storeData, getData } from '../utils/storageUtils';
import { isPointInPolygon, generateCirclePolygon } from '../utils/locationUtils';

/**
 * Get all locations
 * @returns {Promise<Array>} All locations
 */
export const getAllLocations = async () => {
  try {
    return await getData(STORAGE_KEYS.LOCATIONS, []);
  } catch (error) {
    console.error('Get all locations error:', error);
    return [];
  }
};

/**
 * Get location by ID
 * @param {string} locationId - Location ID
 * @returns {Promise<Object|null>} Location or null
 */
export const getLocationById = async (locationId) => {
  try {
    const locations = await getAllLocations();
    return locations.find(l => l.id === locationId) || null;
  } catch (error) {
    console.error('Get location by ID error:', error);
    return null;
  }
};

/**
 * Add new location
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Add result
 */
export const addLocation = async (locationData) => {
  try {
    // Validate required fields
    if (!locationData.name || !locationData.code) {
      return {
        success: false,
        error: 'Location name and code are required',
      };
    }

    if (!locationData.latitude || !locationData.longitude) {
      return {
        success: false,
        error: 'Location coordinates are required',
      };
    }

    const locations = await getAllLocations();

    // Check for duplicate code
    if (locations.some(l => l.code === locationData.code.toUpperCase())) {
      return {
        success: false,
        error: 'Location code already exists',
      };
    }

    // Create new location
    const newLocation = {
      id: `LOC${Date.now()}`,
      name: locationData.name,
      code: locationData.code.toUpperCase(),
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      radius: parseInt(locationData.radius) || 200,
      polygonPoints: locationData.polygonPoints || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    locations.push(newLocation);
    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Location added successfully',
      location: newLocation,
    };
  } catch (error) {
    console.error('Add location error:', error);
    return {
      success: false,
      error: 'Error adding location',
    };
  }
};

/**
 * Update location
 * @param {string} locationId - Location ID
 * @param {Object} updates - Location updates
 * @returns {Promise<Object>} Update result
 */
export const updateLocation = async (locationId, updates) => {
  try {
    const locations = await getAllLocations();
    const locIndex = locations.findIndex(l => l.id === locationId);

    if (locIndex === -1) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    // Update allowed fields
    const allowedFields = ['name', 'latitude', 'longitude', 'radius', 'polygonPoints', 'isActive'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'latitude' || field === 'longitude') {
          locations[locIndex][field] = parseFloat(updates[field]);
        } else if (field === 'radius') {
          locations[locIndex][field] = parseInt(updates[field]);
        } else {
          locations[locIndex][field] = updates[field];
        }
      }
    });

    locations[locIndex].updatedAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Location updated successfully',
      location: locations[locIndex],
    };
  } catch (error) {
    console.error('Update location error:', error);
    return {
      success: false,
      error: 'Error updating location',
    };
  }
};

/**
 * Delete location
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteLocation = async (locationId) => {
  try {
    const locations = await getAllLocations();
    const filteredLocations = locations.filter(l => l.id !== locationId);

    if (filteredLocations.length === locations.length) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    await storeData(STORAGE_KEYS.LOCATIONS, filteredLocations);

    return {
      success: true,
      message: 'Location deleted successfully',
    };
  } catch (error) {
    console.error('Delete location error:', error);
    return {
      success: false,
      error: 'Error deleting location',
    };
  }
};

/**
 * Add polygon point to location
 * @param {string} locationId - Location ID
 * @param {Object} point - Point {latitude, longitude}
 * @returns {Promise<Object>} Add result
 */
export const addPolygonPoint = async (locationId, point) => {
  try {
    const locations = await getAllLocations();
    const locIndex = locations.findIndex(l => l.id === locationId);

    if (locIndex === -1) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    if (!locations[locIndex].polygonPoints) {
      locations[locIndex].polygonPoints = [];
    }

    locations[locIndex].polygonPoints.push({
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
    });

    locations[locIndex].updatedAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Point added successfully',
      location: locations[locIndex],
    };
  } catch (error) {
    console.error('Add polygon point error:', error);
    return {
      success: false,
      error: 'Error adding point',
    };
  }
};

/**
 * Remove last polygon point
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Remove result
 */
export const removeLastPolygonPoint = async (locationId) => {
  try {
    const locations = await getAllLocations();
    const locIndex = locations.findIndex(l => l.id === locationId);

    if (locIndex === -1) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    if (!locations[locIndex].polygonPoints || locations[locIndex].polygonPoints.length === 0) {
      return {
        success: false,
        error: 'No points to remove',
      };
    }

    locations[locIndex].polygonPoints.pop();
    locations[locIndex].updatedAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Point removed successfully',
      location: locations[locIndex],
    };
  } catch (error) {
    console.error('Remove last polygon point error:', error);
    return {
      success: false,
      error: 'Error removing point',
    };
  }
};

/**
 * Clear all polygon points
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Clear result
 */
export const clearPolygonPoints = async (locationId) => {
  try {
    const locations = await getAllLocations();
    const locIndex = locations.findIndex(l => l.id === locationId);

    if (locIndex === -1) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    locations[locIndex].polygonPoints = null;
    locations[locIndex].updatedAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Polygon cleared successfully',
      location: locations[locIndex],
    };
  } catch (error) {
    console.error('Clear polygon points error:', error);
    return {
      success: false,
      error: 'Error clearing polygon',
    };
  }
};

/**
 * Generate circular polygon for location
 * @param {string} locationId - Location ID
 * @param {number} points - Number of points
 * @returns {Promise<Object>} Generate result
 */
export const generateCircularPolygon = async (locationId, points = 8) => {
  try {
    const locations = await getAllLocations();
    const locIndex = locations.findIndex(l => l.id === locationId);

    if (locIndex === -1) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    const location = locations[locIndex];
    const polygonPoints = generateCirclePolygon(
      { latitude: location.latitude, longitude: location.longitude },
      location.radius,
      points
    );

    locations[locIndex].polygonPoints = polygonPoints;
    locations[locIndex].updatedAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LOCATIONS, locations);

    return {
      success: true,
      message: 'Circular polygon generated successfully',
      location: locations[locIndex],
    };
  } catch (error) {
    console.error('Generate circular polygon error:', error);
    return {
      success: false,
      error: 'Error generating polygon',
    };
  }
};

/**
 * Check if point is within location geofence
 * @param {Object} point - Point {latitude, longitude}
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Check result
 */
export const checkPointInGeofence = async (point, locationId) => {
  try {
    const location = await getLocationById(locationId);

    if (!location) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    // If polygon is defined, use polygon check
    if (location.polygonPoints && location.polygonPoints.length >= 3) {
      const isInside = isPointInPolygon(point, location.polygonPoints);
      return {
        success: true,
        isInside,
        method: 'polygon',
      };
    }

    // Otherwise use circular geofence
    const distance = calculateDistance(
      point.latitude,
      point.longitude,
      location.latitude,
      location.longitude
    );

    return {
      success: true,
      isInside: distance <= location.radius,
      distance,
      method: 'radius',
    };
  } catch (error) {
    console.error('Check point in geofence error:', error);
    return {
      success: false,
      error: 'Error checking geofence',
    };
  }
};

/**
 * Calculate distance between two coordinates
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Get active locations only
 * @returns {Promise<Array>} Active locations
 */
export const getActiveLocations = async () => {
  try {
    const locations = await getAllLocations();
    return locations.filter(l => l.isActive !== false);
  } catch (error) {
    console.error('Get active locations error:', error);
    return [];
  }
};

/**
 * Search locations
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching locations
 */
export const searchLocations = async (query) => {
  try {
    const locations = await getAllLocations();
    if (!query || query.trim() === '') return locations;

    const lowerQuery = query.toLowerCase();
    return locations.filter(
      l =>
        l.name.toLowerCase().includes(lowerQuery) ||
        l.code.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Search locations error:', error);
    return [];
  }
};

export default {
  getAllLocations,
  getLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
  addPolygonPoint,
  removeLastPolygonPoint,
  clearPolygonPoints,
  generateCircularPolygon,
  checkPointInGeofence,
  getActiveLocations,
  searchLocations,
};
