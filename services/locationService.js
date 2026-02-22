/**
 * AAI Attendance App - Location Service (API-connected)
 * All location operations go through Next.js backend API
 */

import { API_ENDPOINTS } from '../constants/api';
import { api } from '../utils/apiClient';

/**
 * Calculate distance between two coordinates (Haversine)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
 * Check if a point is within a polygon (ray casting algorithm)
 */
export const isPointInPolygon = (point, polygon) => {
  const { latitude: px, longitude: py } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { latitude: xi, longitude: yi } = polygon[i];
    const { latitude: xj, longitude: yj } = polygon[j];

    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Get all locations from API
 */
export const getAllLocations = async (activeOnly = false) => {
  try {
    const params = activeOnly ? '?isActive=true' : '';
    const result = await api.get(`${API_ENDPOINTS.LOCATIONS}${params}`);
    if (result.success) return result.locations || [];
    return [];
  } catch (error) {
    console.error('[locationService] getAllLocations:', error);
    return [];
  }
};

/**
 * Get location by ID from API
 */
export const getLocationById = async (locationId) => {
  if (!locationId) return null;
  try {
    const result = await api.get(`${API_ENDPOINTS.LOCATIONS}/${locationId}`);
    if (result.success) return result.location;
    return null;
  } catch (error) {
    console.error('[locationService] getLocationById:', error);
    return null;
  }
};

/**
 * Add new location via API (admin only)
 */
export const addLocation = async (locationData) => {
  try {
    const result = await api.post(API_ENDPOINTS.LOCATIONS, {
      name: locationData.name,
      code: locationData.code?.toUpperCase(),
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      radius: parseInt(locationData.radius) || 200,
      address: locationData.address,
      isActive: true,
      allowedDepartments: locationData.allowedDepartments || [],
      adminId: locationData.adminId,
    });

    return {
      success: result.success,
      location: result.location,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('[locationService] addLocation:', error);
    return { success: false, error: 'Error adding location' };
  }
};

/**
 * Update location via API (admin only)
 */
export const updateLocation = async (locationId, updates) => {
  try {
    const result = await api.put(`${API_ENDPOINTS.LOCATIONS}/${locationId}`, updates);
    return {
      success: result.success,
      location: result.location,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('[locationService] updateLocation:', error);
    return { success: false, error: 'Error updating location' };
  }
};

/**
 * Delete location via API (admin only)
 */
export const deleteLocation = async (locationId) => {
  try {
    const result = await api.delete(`${API_ENDPOINTS.LOCATIONS}/${locationId}`);
    return {
      success: result.success,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('[locationService] deleteLocation:', error);
    return { success: false, error: 'Error deleting location' };
  }
};

/**
 * Check if point is within location's geofence (local calculation)
 */
export const checkPointInGeofence = (userLocation, workplaceLocation) => {
  if (!userLocation || !workplaceLocation) return { isInside: false, distance: null };

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    workplaceLocation.latitude,
    workplaceLocation.longitude
  );

  const radius = workplaceLocation.radius || 200;
  const isInside = distance <= radius;

  return {
    isInside,
    distance,
    radius,
    formattedDistance: formatDistance(distance),
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown';
  if (distance < 1000) return `${Math.round(distance)}m`;
  return `${(distance / 1000).toFixed(1)}km`;
};

/**
 * Get active locations only
 */
export const getActiveLocations = async () => getAllLocations(true);

/**
 * Assign admin to location (super_admin only)
 */
export const assignAdminToLocation = async (locationId, adminUserId) => {
  try {
    const result = await api.patch(`${API_ENDPOINTS.LOCATIONS}/${locationId}`, {
      adminId: adminUserId,
    });
    return {
      success: result.success,
      location: result.location,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('[locationService] assignAdminToLocation:', error);
    return { success: false, error: 'Error assigning admin' };
  }
};

export default {
  getAllLocations,
  getLocationById,
  addLocation,
  updateLocation,
  deleteLocation,
  checkPointInGeofence,
  formatDistance,
  calculateDistance,
  isPointInPolygon,
  getActiveLocations,
  assignAdminToLocation,
};
