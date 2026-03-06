/**
 * AAI Attendance App - Attendance Service (API-connected)
 * All operations go through Next.js backend API
 */

import { API_ENDPOINTS } from '../constants/api';
import { api, uploadFile } from '../utils/apiClient';
import { getData } from '../utils/storageUtils';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';

const USER_SESSION_KEY = '@user_session';

/**
 * Get today's attendance from API
 */
export const getTodayAttendance = async () => {
  try {
    const result = await api.get(API_ENDPOINTS.ATTENDANCE_TODAY);
    if (result.success) return result.record;
    return null;
  } catch (error) {
    console.error('[attendanceService] getTodayAttendance:', error);
    return null;
  }
};

/**
 * Get attendance status summary for dashboard
 */
export const getAttendanceStatus = async () => {
  try {
    const record = await getTodayAttendance();

    return {
      hasCheckedIn: !!(record?.checkIn),
      hasCheckedOut: !!(record?.checkOut),
      checkInTime: record?.checkIn?.time || null,
      checkOutTime: record?.checkOut?.time || null,
      checkInPhoto: record?.checkIn?.photoUrl || record?.checkIn?.photo || null,
      checkOutPhoto: record?.checkOut?.photoUrl || record?.checkOut?.photo || null,
      checkInLocation: record?.checkIn?.locationId?.name || null,
      checkOutLocation: record?.checkOut?.locationId?.name || null,
      totalHours: record?.duration || 0,
      isComplete: !!(record?.checkIn && record?.checkOut),
      status: record?.status || null,
    };
  } catch (error) {
    console.error('[attendanceService] getAttendanceStatus:', error);
    return {
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null,
      totalHours: 0,
      isComplete: false,
    };
  }
};

/**
 * Get user's current GPS location
 */
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission denied' };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        timestamp: location.timestamp,
      },
    };
  } catch (error) {
    console.error('[attendanceService] getCurrentLocation:', error);
    return {
      success: false,
      error: 'Unable to get location. Please check GPS is enabled.',
    };
  }
};

/**
 * Check if user is within geofence (using backend or local calculation)
 */
export const checkUserGeofence = async (userLocation, locationId) => {
  try {
    const result = await api.post('/api/attendance/check-geofence', {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      locationId,
    });
    return result;
  } catch (error) {
    console.error('[attendanceService] checkUserGeofence:', error);
    return { success: false, error: 'Error checking geofence' };
  }
};

/**
 * Save photo to local attendance_photos folder
 */
const savePhotoLocally = async (photoUri, type) => {
  if (!photoUri) return null; // No photo to save
  try {
    const photosDir = FileSystem.documentDirectory + 'attendance_photos/';
    const dirInfo = await FileSystem.getInfoAsync(photosDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
    }

    const fileName = `${type}_${Date.now()}.jpg`;
    const localUri = photosDir + fileName;
    await FileSystem.copyAsync({ from: photoUri, to: localUri });
    return localUri;
  } catch (error) {
    console.error('[attendanceService] savePhotoLocally:', error);
    return photoUri; // fallback to original
  }
};

/**
 * Upload photo to backend and get URL
 */
const uploadAttendancePhoto = async (photoUri, type) => {
  try {
    const result = await uploadFile('/api/upload/attendance-photo', photoUri, 'photo', { type });
    if (result.success && result.url) return result.url;
    return null;
  } catch (error) {
    console.error('[attendanceService] uploadAttendancePhoto:', error);
    return null;
  }
};

/**
 * Mark check-in via API with location + photo
 */
export const markCheckIn = async (location, photoUri, locationId) => {
  try {
    // Save photo locally first (null-safe)
    const localPhotoUri = photoUri ? await savePhotoLocally(photoUri, 'checkin') : null;

    // Try to upload to backend (only if a photo was taken)
    let photoUrl = null;
    if (photoUri) {
      photoUrl = await uploadAttendancePhoto(photoUri, 'checkin');
      // If upload fails, we still proceed with check-in (photo is optional for attendance)
    }

    const result = await api.post(API_ENDPOINTS.CHECK_IN, {
      location: {
        lat: location?.latitude,
        lng: location?.longitude,
        accuracy: location?.accuracy,
      },
      photoUrl: photoUrl || localPhotoUri || null,
      localPhotoUri: localPhotoUri || null,
      locationId,
    });

    return {
      success: result.success !== false,
      message: result.message,
      error: result.error,
      record: result.record,
    };
  } catch (error) {
    console.error('[attendanceService] markCheckIn:', error);
    return { success: false, error: 'Error marking check-in. Please try again.' };
  }
};

/**
 * Mark check-out via API with location + photo
 */
export const markCheckOut = async (location, photoUri, locationId) => {
  try {
    // Save photo locally first (null-safe)
    const localPhotoUri = photoUri ? await savePhotoLocally(photoUri, 'checkout') : null;

    // Try to upload to backend (only if a photo was taken)
    let photoUrl = null;
    if (photoUri) {
      photoUrl = await uploadAttendancePhoto(photoUri, 'checkout');
      // If upload fails, we still proceed with check-out (photo is optional)
    }
    console.log(`[attendanceService] MarkCheckOut: photoUri exists: ${!!photoUri}, photoUrl from server: ${!!photoUrl}, localPhotoUri: ${!!localPhotoUri}`);

    const result = await api.post(API_ENDPOINTS.CHECK_OUT, {
      location: {
        lat: location?.latitude,
        lng: location?.longitude,
        accuracy: location?.accuracy,
      },
      photoUrl: photoUrl || localPhotoUri || null,
      localPhotoUri: localPhotoUri || null,
      locationId,
    });

    return {
      success: result.success !== false,
      message: result.message,
      error: result.error,
      record: result.record,
    };
  } catch (error) {
    console.error('[attendanceService] markCheckOut:', error);
    return { success: false, error: 'Error marking check-out. Please try again.' };
  }
};

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...filters,
    });

    const result = await api.get(`${API_ENDPOINTS.ATTENDANCE_HISTORY}?${params}`);

    if (result.success) {
      return {
        success: true,
        records: result.records || [],
        pagination: result.pagination,
      };
    }

    return { success: false, records: [], error: result.error };
  } catch (error) {
    console.error('[attendanceService] getAttendanceHistory:', error);
    return { success: false, records: [], error: 'Failed to load attendance history' };
  }
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (month, year) => {
  try {
    // Build date range from month/year
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const result = await api.get(
      `${API_ENDPOINTS.ATTENDANCE_STATS}?startDate=${startDate}&endDate=${endDate}`
    );

    if (result.success && result.stats) {
      const s = result.stats;
      // Normalize API response keys → UI expected keys
      return {
        success: true,
        totalDays: s.totalDays || 0,
        presentDays: s.present || s.presentDays || 0,
        absentDays: s.absent || s.absentDays || 0,
        halfDays: s.halfDay || s.halfDays || 0,
        leaveDays: s.onLeave || s.leaveDays || 0,
        totalHours: s.totalHours || 0,
        averageHours: s.avgHours || s.averageHours || 0,
        attendancePercentage: s.attendanceRate || s.attendancePercentage || 0,
      };
    }

    return getDefaultStats();
  } catch (error) {
    console.error('[attendanceService] getAttendanceStats:', error);
    return getDefaultStats();
  }
};

const getDefaultStats = () => ({
  success: false,
  totalDays: 0,
  presentDays: 0,
  absentDays: 0,
  halfDays: 0,
  leaveDays: 0,
  totalHours: 0,
  averageHours: 0,
  attendancePercentage: 0,
});

/**
 * Sync status (kept for backward compatibility)
 */
export const getSyncStatus = async () => ({
  pendingCount: 0,
  lastSync: new Date().toISOString(),
  hasPending: false,
});

export const syncAttendance = async () => ({
  success: true,
  synced: 0,
  message: 'All data is synced to server',
});

export default {
  getTodayAttendance,
  getAttendanceStatus,
  getCurrentLocation,
  checkUserGeofence,
  markCheckIn,
  markCheckOut,
  getAttendanceHistory,
  getAttendanceStats,
  getSyncStatus,
  syncAttendance,
};
