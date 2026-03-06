/**
 * AAI Attendance App - Attendance Context (API-connected)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getTodayAttendance as getTodayAttendanceService,
  getAttendanceStatus as getAttendanceStatusService,
  getCurrentLocation as getCurrentLocationService,
  markCheckIn as markCheckInService,
  markCheckOut as markCheckOutService,
  getAttendanceHistory as getAttendanceHistoryService,
  getAttendanceStats as getAttendanceStatsService,
  syncAttendance as syncAttendanceService,
  getSyncStatus as getSyncStatusService,
} from '../services/attendanceService';
import { checkPointInGeofence } from '../services/locationService';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within an AttendanceProvider');
  return context;
};

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
    halfDays: 0,
    leaveDays: 0,
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

  const getTodayAttendance = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const result = await getTodayAttendanceService();
      setTodayAttendance(result);
      return result;
    } catch (error) {
      console.error('[AttendanceContext] getTodayAttendance:', error);
      return null;
    }
  }, [isAuthenticated]);

  const getAttendanceStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const status = await getAttendanceStatusService();
      setAttendanceStatus(status);
      return status;
    } catch (error) {
      console.error('[AttendanceContext] getAttendanceStatus:', error);
    }
  }, [isAuthenticated]);

  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      return await getCurrentLocationService();
    } catch (error) {
      console.error('[AttendanceContext] getCurrentLocation:', error);
      return { success: false, error: 'Failed to get location' };
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const checkGeofence = useCallback(async (userLocation, workplaceLocation) => {
    try {
      if (!workplaceLocation) {
        return { success: false, isInside: false, error: 'No workplace location set' };
      }
      const result = checkPointInGeofence(userLocation, workplaceLocation);
      return { success: true, ...result };
    } catch (error) {
      console.error('[AttendanceContext] checkGeofence:', error);
      return { success: false, error: 'Failed to check geofence' };
    }
  }, []);

  const markCheckIn = useCallback(async (location, photoUri, locationId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const result = await markCheckInService(location, photoUri, locationId);
      if (result.success) {
        setTodayAttendance(result.record);
        await getAttendanceStatus();
      }
      return result;
    } catch (error) {
      console.error('[AttendanceContext] markCheckIn:', error);
      return { success: false, error: 'Failed to mark check-in' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAttendanceStatus]);

  const markCheckOut = useCallback(async (location, photoUri, locationId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const result = await markCheckOutService(location, photoUri, locationId);
      if (result.success) {
        setTodayAttendance(result.record);
        await getAttendanceStatus();
      }
      return result;
    } catch (error) {
      console.error('[AttendanceContext] markCheckOut:', error);
      return { success: false, error: 'Failed to mark check-out' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAttendanceStatus]);

  const getAttendanceHistory = useCallback(async (page = 1, filters = {}) => {
    if (!isAuthenticated) return [];
    setLoading(true);
    try {
      const result = await getAttendanceHistoryService(page, 20, filters);
      if (result.success) {
        setAttendanceHistory(result.records || []);
        return result.records || [];
      }
      return [];
    } catch (error) {
      console.error('[AttendanceContext] getAttendanceHistory:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getAttendanceStats = useCallback(async (month, year) => {
    if (!isAuthenticated) return;
    try {
      const now = new Date();
      const result = await getAttendanceStatsService(
        month ?? now.getMonth() + 1,
        year ?? now.getFullYear()
      );
      setAttendanceStats(result);
      return result;
    } catch (error) {
      console.error('[AttendanceContext] getAttendanceStats:', error);
    }
  }, [isAuthenticated]);

  // Monthly calendar: derive from history
  const getMonthlyCalendar = useCallback(async (year, month) => {
    if (!isAuthenticated) return {};
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      const result = await getAttendanceHistoryService(1, 31, { startDate: `${monthStr}-01`, endDate: `${monthStr}-31` });
      const calendarMap = {};
      (result.records || []).forEach(record => {
        const day = parseInt(record.date?.split('-')[2]);
        if (day) {
          calendarMap[day] = {
            status: record.status,
            checkIn: record.checkIn?.time,
            checkOut: record.checkOut?.time,
            totalHours: record.duration,
          };
        }
      });
      return calendarMap;
    } catch (error) {
      console.error('[AttendanceContext] getMonthlyCalendar:', error);
      return {};
    }
  }, [isAuthenticated]);

  const syncAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const result = await syncAttendanceService();
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to sync' };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatusService();
      setSyncStatus(status);
      return status;
    } catch (error) {
      return { pendingCount: 0, lastSync: null, hasPending: false };
    }
  }, []);

  const refreshAttendanceData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await Promise.all([getAttendanceStatus(), getAttendanceStats()]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAttendanceStatus, getAttendanceStats]);

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
