/**
 * AAI Attendance App - Attendance Service
 * Handles attendance marking, history, and related operations
 */

import { STORAGE_KEYS, ATTENDANCE_CONFIG } from '../constants/config';
import { storeData, getData, updateInArray } from '../utils/storageUtils';
import { getTodayKey, getMonthKey, calculateTotalHours, isToday, formatDate } from '../utils/dateUtils';
import { checkGeofence, formatDistance } from '../utils/locationUtils';
import * as Location from 'expo-location';

/**
 * Get user's attendance for today
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Today's attendance record
 */
export const getTodayAttendance = async (employeeId) => {
  try {
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const todayKey = getTodayKey();
    
    const todayRecord = records.find(
      r => r.employeeId === employeeId && r.date === todayKey
    );
    
    return todayRecord || null;
  } catch (error) {
    console.error('Get today attendance error:', error);
    return null;
  }
};

/**
 * Get attendance status for dashboard
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Attendance status
 */
export const getAttendanceStatus = async (employeeId) => {
  try {
    const todayRecord = await getTodayAttendance(employeeId);
    
    return {
      hasCheckedIn: todayRecord?.checkIn ? true : false,
      hasCheckedOut: todayRecord?.checkOut ? true : false,
      checkInTime: todayRecord?.checkIn?.time || null,
      checkOutTime: todayRecord?.checkOut?.time || null,
      checkInLocation: todayRecord?.checkIn?.locationName || null,
      checkOutLocation: todayRecord?.checkOut?.locationName || null,
      totalHours: todayRecord?.totalHours || 0,
      isComplete: todayRecord?.checkIn && todayRecord?.checkOut,
    };
  } catch (error) {
    console.error('Get attendance status error:', error);
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
 * Get user's current location
 * @returns {Promise<Object>} Location result
 */
export const getCurrentLocation = async () => {
  try {
    // Check permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        success: false,
        error: 'Location permission denied',
      };
    }

    // Get location
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
    console.error('Get current location error:', error);
    return {
      success: false,
      error: 'Unable to get location. Please check if GPS is enabled.',
    };
  }
};

/**
 * Check if user is within geofence
 * @param {Object} userLocation - User's location
 * @param {string} locationId - Workplace location ID
 * @returns {Promise<Object>} Geofence check result
 */
export const checkUserGeofence = async (userLocation, locationId) => {
  try {
    // Get location details
    const locations = await getData(STORAGE_KEYS.LOCATIONS, []);
    const workplace = locations.find(l => l.id === locationId);

    if (!workplace) {
      return {
        success: false,
        error: 'Workplace location not found',
      };
    }

    // Check geofence
    const isInside = checkGeofence(userLocation, workplace);
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workplace.latitude,
      workplace.longitude
    );

    return {
      success: true,
      isInside,
      distance,
      formattedDistance: formatDistance(distance),
      workplace,
    };
  } catch (error) {
    console.error('Check geofence error:', error);
    return {
      success: false,
      error: 'Error checking geofence',
    };
  }
};

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
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
 * Mark check-in
 * @param {string} employeeId - Employee ID
 * @param {Object} location - User's location
 * @param {string} photoUri - Captured photo URI
 * @returns {Promise<Object>} Check-in result
 */
export const markCheckIn = async (employeeId, location, photoUri) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if already checked in today
    const todayRecord = await getTodayAttendance(employeeId);
    if (todayRecord?.checkIn) {
      return {
        success: false,
        error: 'You have already checked in today',
      };
    }

    // Get user's assigned location
    const session = await getData(STORAGE_KEYS.USER_SESSION, null);
    const locations = await getData(STORAGE_KEYS.LOCATIONS, []);
    const workplace = locations.find(l => l.id === session?.location);

    // Create check-in record
    const checkInData = {
      time: new Date().toISOString(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
      locationName: workplace?.name || 'Unknown Location',
      photoUri,
    };

    // Create or update attendance record
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const todayKey = getTodayKey();

    const newRecord = {
      id: `ATT${Date.now()}`,
      employeeId,
      date: todayKey,
      checkIn: checkInData,
      checkOut: null,
      totalHours: 0,
      status: 'present',
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    records.push(newRecord);
    await storeData(STORAGE_KEYS.ATTENDANCE_RECORDS, records);

    // Add to sync queue
    await addToSyncQueue({
      type: 'attendance',
      action: 'checkIn',
      data: newRecord,
    });

    return {
      success: true,
      message: 'Check-in successful',
      record: newRecord,
    };
  } catch (error) {
    console.error('Mark check-in error:', error);
    return {
      success: false,
      error: 'Error marking check-in. Please try again.',
    };
  }
};

/**
 * Mark check-out
 * @param {string} employeeId - Employee ID
 * @param {Object} location - User's location
 * @param {string} photoUri - Captured photo URI
 * @returns {Promise<Object>} Check-out result
 */
export const markCheckOut = async (employeeId, location, photoUri) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if checked in
    const todayRecord = await getTodayAttendance(employeeId);
    if (!todayRecord?.checkIn) {
      return {
        success: false,
        error: 'You must check in before checking out',
      };
    }

    // Check if already checked out
    if (todayRecord?.checkOut) {
      return {
        success: false,
        error: 'You have already checked out today',
      };
    }

    // Get user's assigned location
    const session = await getData(STORAGE_KEYS.USER_SESSION, null);
    const locations = await getData(STORAGE_KEYS.LOCATIONS, []);
    const workplace = locations.find(l => l.id === session?.location);

    // Create check-out record
    const checkOutData = {
      time: new Date().toISOString(),
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
      locationName: workplace?.name || 'Unknown Location',
      photoUri,
    };

    // Calculate total hours
    const totalHours = calculateTotalHours(todayRecord.checkIn.time, checkOutData.time);

    // Update attendance record
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const recordIndex = records.findIndex(
      r => r.employeeId === employeeId && r.date === todayRecord.date
    );

    if (recordIndex === -1) {
      return {
        success: false,
        error: 'Attendance record not found',
      };
    }

    records[recordIndex].checkOut = checkOutData;
    records[recordIndex].totalHours = totalHours;
    records[recordIndex].syncStatus = 'pending';

    await storeData(STORAGE_KEYS.ATTENDANCE_RECORDS, records);

    // Add to sync queue
    await addToSyncQueue({
      type: 'attendance',
      action: 'checkOut',
      data: records[recordIndex],
    });

    return {
      success: true,
      message: 'Check-out successful',
      record: records[recordIndex],
    };
  } catch (error) {
    console.error('Mark check-out error:', error);
    return {
      success: false,
      error: 'Error marking check-out. Please try again.',
    };
  }
};

/**
 * Get attendance history
 * @param {string} employeeId - Employee ID
 * @param {string} monthKey - Month key (YYYY-MM)
 * @returns {Promise<Array>} Attendance records
 */
export const getAttendanceHistory = async (employeeId, monthKey) => {
  try {
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    
    // Filter records for employee and month
    const filteredRecords = records.filter(r => {
      if (r.employeeId !== employeeId) return false;
      if (monthKey) {
        return r.date.startsWith(monthKey);
      }
      return true;
    });

    // Sort by date descending
    return filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Get attendance history error:', error);
    return [];
  }
};

/**
 * Get attendance statistics
 * @param {string} employeeId - Employee ID
 * @param {string} monthKey - Month key (YYYY-MM)
 * @returns {Promise<Object>} Statistics
 */
export const getAttendanceStats = async (employeeId, monthKey) => {
  try {
    const records = await getAttendanceHistory(employeeId, monthKey);
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const halfDays = records.filter(r => r.status === 'halfDay').length;
    const leaveDays = records.filter(r => r.status === 'leave').length;
    
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    const attendancePercentage = totalDays > 0 
      ? ((presentDays + leaveDays) / totalDays) * 100 
      : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      totalHours: parseFloat(totalHours.toFixed(2)),
      averageHours: parseFloat(averageHours.toFixed(2)),
      attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
    };
  } catch (error) {
    console.error('Get attendance stats error:', error);
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      halfDays: 0,
      leaveDays: 0,
      totalHours: 0,
      averageHours: 0,
      attendancePercentage: 0,
    };
  }
};

/**
 * Get monthly attendance calendar data
 * @param {string} employeeId - Employee ID
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Promise<Object>} Calendar data
 */
export const getMonthlyCalendar = async (employeeId, year, month) => {
  try {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const records = await getAttendanceHistory(employeeId, monthKey);
    
    // Create calendar map
    const calendarMap = {};
    records.forEach(record => {
      const day = parseInt(record.date.split('-')[2]);
      calendarMap[day] = {
        status: record.status,
        checkIn: record.checkIn?.time,
        checkOut: record.checkOut?.time,
        totalHours: record.totalHours,
      };
    });

    return calendarMap;
  } catch (error) {
    console.error('Get monthly calendar error:', error);
    return {};
  }
};

/**
 * Add item to sync queue
 * @param {Object} item - Item to sync
 */
const addToSyncQueue = async (item) => {
  try {
    const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
    queue.push({
      id: `SYNC${Date.now()}`,
      ...item,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
    await storeData(STORAGE_KEYS.SYNC_QUEUE, queue);
  } catch (error) {
    console.error('Add to sync queue error:', error);
  }
};

/**
 * Sync pending attendance records
 * @returns {Promise<Object>} Sync result
 */
export const syncAttendance = async () => {
  try {
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const pendingRecords = records.filter(r => r.syncStatus === 'pending');

    if (pendingRecords.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'All records are up to date',
      };
    }

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark records as synced
    const updatedRecords = records.map(r => {
      if (r.syncStatus === 'pending') {
        return { ...r, syncStatus: 'synced', syncedAt: new Date().toISOString() };
      }
      return r;
    });

    await storeData(STORAGE_KEYS.ATTENDANCE_RECORDS, updatedRecords);

    // Update sync queue
    const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
    const updatedQueue = queue.filter(item => 
      !(item.type === 'attendance' && pendingRecords.some(r => r.id === item.data.id))
    );
    await storeData(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);

    // Update last sync time
    await storeData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    return {
      success: true,
      synced: pendingRecords.length,
      message: `${pendingRecords.length} record(s) synced successfully`,
    };
  } catch (error) {
    console.error('Sync attendance error:', error);
    return {
      success: false,
      error: 'Error syncing attendance records',
    };
  }
};

/**
 * Get sync status
 * @returns {Promise<Object>} Sync status
 */
export const getSyncStatus = async () => {
  try {
    const records = await getData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
    const pendingCount = records.filter(r => r.syncStatus === 'pending').length;
    const lastSync = await getData(STORAGE_KEYS.LAST_SYNC, null);

    return {
      pendingCount,
      lastSync,
      hasPending: pendingCount > 0,
    };
  } catch (error) {
    console.error('Get sync status error:', error);
    return {
      pendingCount: 0,
      lastSync: null,
      hasPending: false,
    };
  }
};

export default {
  getTodayAttendance,
  getAttendanceStatus,
  getCurrentLocation,
  checkUserGeofence,
  markCheckIn,
  markCheckOut,
  getAttendanceHistory,
  getAttendanceStats,
  getMonthlyCalendar,
  syncAttendance,
  getSyncStatus,
};
