/**
 * AAI Attendance App - Location Utility Functions
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371e3; // Earth's radius in meters
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
 * Check if a point is within a circular geofence
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {Object} center - Geofence center {latitude, longitude}
 * @param {number} radius - Geofence radius in meters
 * @returns {boolean} True if user is inside geofence
 */
export const isWithinGeofence = (userLocation, center, radius) => {
  if (!userLocation || !center || !radius) return false;
  
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    center.latitude,
    center.longitude
  );
  
  return distance <= radius;
};

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {Object} point - Point to check {latitude, longitude}
 * @param {Array} polygon - Array of points [{latitude, longitude}, ...]
 * @returns {boolean} True if point is inside polygon
 */
export const isPointInPolygon = (point, polygon) => {
  if (!point || !polygon || polygon.length < 3) return false;
  
  let inside = false;
  const x = point.longitude;
  const y = point.latitude;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;
    
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

/**
 * Check if user is within geofence (supports both circle and polygon)
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {Object} location - Location object with center, radius, and optional polygon
 * @returns {boolean} True if user is inside geofence
 */
export const checkGeofence = (userLocation, location) => {
  if (!userLocation || !location) return false;
  
  // If polygon is defined, use polygon check
  if (location.polygonPoints && location.polygonPoints.length >= 3) {
    return isPointInPolygon(userLocation, location.polygonPoints);
  }
  
  // Otherwise use circular geofence
  return isWithinGeofence(
    userLocation,
    { latitude: location.latitude, longitude: location.longitude },
    location.radius || 200
  );
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined) return 'N/A';
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return 'N/A';
  
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }
  
  return `${(distance / 1000).toFixed(2)} km`;
};

/**
 * Get geofence status text and color
 * @param {boolean} isInside - Whether user is inside geofence
 * @returns {Object} Status object with text and color
 */
export const getGeofenceStatus = (isInside) => {
  if (isInside) {
    return {
      text: 'Inside Geofence',
      color: '#10B981', // Success green
      backgroundColor: '#D1FAE5',
      icon: 'check-circle',
    };
  }
  
  return {
    text: 'Outside Geofence',
    color: '#EF4444', // Error red
    backgroundColor: '#FEE2E2',
    icon: 'close-circle',
  };
};

/**
 * Calculate bounding box for a set of coordinates
 * @param {Array} coordinates - Array of {latitude, longitude}
 * @returns {Object} Bounding box with min/max lat/lng
 */
export const calculateBoundingBox = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;
  
  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;
  
  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  }
  
  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    center: {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
    },
  };
};

/**
 * Get map region from coordinates
 * @param {Array} coordinates - Array of {latitude, longitude}
 * @param {number} padding - Padding factor (default: 1.5)
 * @returns {Object} Map region object
 */
export const getMapRegion = (coordinates, padding = 1.5) => {
  if (!coordinates || coordinates.length === 0) {
    return {
      latitude: 20.5937, // Center of India
      longitude: 78.9629,
      latitudeDelta: 30,
      longitudeDelta: 30,
    };
  }
  
  const bbox = calculateBoundingBox(coordinates);
  
  const latDelta = (bbox.maxLat - bbox.minLat) * padding;
  const lngDelta = (bbox.maxLng - bbox.minLng) * padding;
  
  return {
    latitude: bbox.center.latitude,
    longitude: bbox.center.longitude,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
};

/**
 * Validate coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (latitude, longitude) => {
  if (latitude === undefined || longitude === undefined) return false;
  if (latitude === null || longitude === null) return false;
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  
  return true;
};

/**
 * Generate polygon points for a circular geofence
 * @param {Object} center - Center point {latitude, longitude}
 * @param {number} radius - Radius in meters
 * @param {number} points - Number of points (default: 8)
 * @returns {Array} Array of polygon points
 */
export const generateCirclePolygon = (center, radius, points = 8) => {
  if (!center || !radius) return [];
  
  const polygon = [];
  const angleStep = (2 * Math.PI) / points;
  
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    
    // Convert meters to degrees (approximate)
    const latOffset = dy / 111320;
    const lngOffset = dx / (111320 * Math.cos((center.latitude * Math.PI) / 180));
    
    polygon.push({
      latitude: center.latitude + latOffset,
      longitude: center.longitude + lngOffset,
    });
  }
  
  return polygon;
};

export default {
  calculateDistance,
  isWithinGeofence,
  isPointInPolygon,
  checkGeofence,
  formatCoordinates,
  formatDistance,
  getGeofenceStatus,
  calculateBoundingBox,
  getMapRegion,
  isValidCoordinates,
  generateCirclePolygon,
};
