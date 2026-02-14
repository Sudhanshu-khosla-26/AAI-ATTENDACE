/**
 * AAI Attendance App - Attendance Context
 * Manages attendance state and operations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getTodayAttendance as getTodayAttendanceService,
  getAttendanceStatus as getAttendanceStatusService,
  getCurrentLocation as getCurrentLocationService,
  checkUserGeofence as checkUserGeofenceService,
  markCheckIn as markCheckInService,
  markCheckOut as markCheckOutService,
  getAttendanceHistory as getAttendanceHistoryService,
  getAttendanceStats as getAttendanceStatsService,
  getMonthlyCalendar as getMonthlyCalendarService,
  syncAttendance as syncAttendanceService,
  getSyncStatus as getSyncStatusService,
} from '../services/attendanceService';
import { useAuth } from './AuthContext';

// Create context
const AttendanceContext = createContext();

// Custom hook to use attendance context
export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

// Attendance Provider component
export const AttendanceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    checkInTime: null,
    checkOutTime: null,
    totalHours: 0,
    isComplete: false,
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    totalHours: 0,
    attendancePercentage: 0,
  });
  const [syncStatus, setSyncStatus] = useState({
    pendingCount: 0,
    lastSync: null,
    hasPending: false,
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get today's attendance
  const getTodayAttendance = useCallback(async () => {
    if (!isAuthenticated || !user) return null;
    try {
      const result = await getTodayAttendanceService(user.employeeId);
      setTodayAttendance(result);
      return result;
    } catch (error) {
      console.error('Get today attendance error:', error);
      return null;
    }
  }, [isAuthenticated, user]);

  // Get attendance status
  const getAttendanceStatus = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const status = await getAttendanceStatusService(user.employeeId);
      setAttendanceStatus(status);
    } catch (error) {
      console.error('Get attendance status error:', error);
    }
  }, [isAuthenticated, user]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const result = await getCurrentLocationService();
      return result;
    } catch (error) {
      console.error('Get current location error:', error);
      return { success: false, error: 'Failed to get location' };
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Check geofence
  const checkGeofence = useCallback(async (location) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      return await checkUserGeofenceService(location, user.location);
    } catch (error) {
      console.error('Check geofence error:', error);
      return { success: false, error: 'Failed to check geofence' };
    }
  }, [isAuthenticated, user]);

  // Mark check-in
  const markCheckIn = useCallback(async (location, photoUri) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }
    setLoading(true);
    try {
      const result = await markCheckInService(user.employeeId, location, photoUri);
      if (result.success) {
        setTodayAttendance(result.record);
        await getAttendanceStatus();
      }
      return result;
    } catch (error) {
      console.error('Mark check-in error:', error);
      return { success: false, error: 'Failed to mark check-in' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAttendanceStatus]);

  // Mark check-out
  const markCheckOut = useCallback(async (location, photoUri) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }
    setLoading(true);
    try {
      const result = await markCheckOutService(user.employeeId, location, photoUri);
      if (result.success) {
        setTodayAttendance(result.record);
        await getAttendanceStatus();
      }
      return result;
    } catch (error) {
      console.error('Mark check-out error:', error);
      return { success: false, error: 'Failed to mark check-out' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAttendanceStatus]);

  // Get attendance history
  const getAttendanceHistory = useCallback(async (monthKey = null) => {
    if (!isAuthenticated || !user) return [];
    setLoading(true);
    try {
      const history = await getAttendanceHistoryService(user.employeeId, monthKey);
      setAttendanceHistory(history);
      return history;
    } catch (error) {
      console.error('Get attendance history error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Get attendance stats
  const getAttendanceStats = useCallback(async (monthKey = null) => {
    if (!isAuthenticated || !user) return;
    try {
      const stats = await getAttendanceStatsService(user.employeeId, monthKey);
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Get attendance stats error:', error);
    }
  }, [isAuthenticated, user]);

  // Get monthly calendar
  const getMonthlyCalendar = useCallback(async (year, month) => {
    if (!isAuthenticated || !user) return {};
    try {
      return await getMonthlyCalendarService(user.employeeId, year, month);
    } catch (error) {
      console.error('Get monthly calendar error:', error);
      return {};
    }
  }, [isAuthenticated, user]);

  // Sync attendance
  const syncAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const result = await syncAttendanceService();
      if (result.success) {
        await getSyncStatus();
      }
      return result;
    } catch (error) {
      console.error('Sync attendance error:', error);
      return { success: false, error: 'Failed to sync attendance' };
    } finally {
      setLoading(false);
    }
  }, [getSyncStatus]);

  // Get sync status
  const getSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatusService();
      setSyncStatus(status);
      return status;
    } catch (error) {
      console.error('Get sync status error:', error);
      return { pendingCount: 0, lastSync: null, hasPending: false };
    }
  }, []);

  // Refresh all attendance data
  const refreshAttendanceData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      await Promise.all([
        getAttendanceStatus(),
        getAttendanceHistory(),
        getAttendanceStats(),
        getSyncStatus(),
      ]);
    } catch (error) {
      console.error('Refresh attendance data error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAttendanceStatus, getAttendanceHistory, getAttendanceStats, getSyncStatus]);

  // Context value
  const value = {
    todayAttendance,
    attendanceStatus,
    attendanceHistory,
    attendanceStats,
    syncStatus,
    loading,
    locationLoading,
    getTodayAttendance,
    getAttendanceStatus,
    getCurrentLocation,
    checkGeofence,
    markCheckIn,
    markCheckOut,
    getAttendanceHistory,
    getAttendanceStats,
    getMonthlyCalendar,
    syncAttendance,
    getSyncStatus,
    refreshAttendanceData,
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext;
