/**
 * AAI Attendance App - Leave Context
 * Manages leave-related state and operations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getLeaveBalances as getLeaveBalancesService,
  applyForLeave as applyForLeaveService,
  getLeaveApplications as getLeaveApplicationsService,
  cancelLeaveApplication as cancelLeaveApplicationService,
  getLeaveHistory as getLeaveHistoryService,
  getLeaveStats as getLeaveStatsService,
  syncLeaves as syncLeavesService,
} from '../services/leaveService';
import { useAuth } from './AuthContext';

// Create context
const LeaveContext = createContext();

// Custom hook to use leave context
export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};

// Leave Provider component
export const LeaveProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [leaveBalances, setLeaveBalances] = useState({
    CL: { total: 15, used: 0, remaining: 15 },
    SL: { total: 12, used: 0, remaining: 12 },
    EL: { total: 15, used: 0, remaining: 15 },
  });
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState({
    pending: [],
    approved: [],
    rejected: [],
    cancelled: [],
  });
  const [leaveStats, setLeaveStats] = useState({
    totalApplications: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalApprovedDays: 0,
  });
  const [loading, setLoading] = useState(false);

  // Get leave balances
  const getLeaveBalances = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const balances = await getLeaveBalancesService(user.employeeId);
      setLeaveBalances(balances);
      return balances;
    } catch (error) {
      console.error('Get leave balances error:', error);
      return leaveBalances;
    }
  }, [isAuthenticated, user]);

  // Get leave history
  const getLeaveHistory = useCallback(async (filters = {}) => {
    if (!isAuthenticated || !user) return { pending: [], approved: [], rejected: [], cancelled: [] };
    try {
      const history = await getLeaveHistoryService(user.employeeId, filters);
      setLeaveHistory(history);
      return history;
    } catch (error) {
      console.error('Get leave history error:', error);
      return { pending: [], approved: [], rejected: [], cancelled: [] };
    }
  }, [isAuthenticated, user]);

  // Get leave stats
  const getLeaveStats = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const stats = await getLeaveStatsService(user.employeeId);
      setLeaveStats(stats);
      return stats;
    } catch (error) {
      console.error('Get leave stats error:', error);
      return leaveStats;
    }
  }, [isAuthenticated, user]);

  // Get leave applications
  const getLeaveApplications = useCallback(async (status = null) => {
    if (!isAuthenticated || !user) return [];
    try {
      const applications = await getLeaveApplicationsService(user.employeeId, status);
      setLeaveApplications(applications);
      return applications;
    } catch (error) {
      console.error('Get leave applications error:', error);
      return [];
    }
  }, [isAuthenticated, user]);

  // Sync leaves
  const syncLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const result = await syncLeavesService();
      if (result.success) {
        await getLeaveApplications();
      }
      return result;
    } catch (error) {
      console.error('Sync leaves error:', error);
      return { success: false, error: 'Failed to sync leaves' };
    } finally {
      setLoading(false);
    }
  }, [getLeaveApplications]);

  // Refresh all leave data
  const refreshLeaveData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      await Promise.all([
        getLeaveBalances(),
        getLeaveApplications(),
        getLeaveHistory(),
        getLeaveStats(),
      ]);
    } catch (error) {
      console.error('Refresh leave data error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getLeaveBalances, getLeaveApplications, getLeaveHistory, getLeaveStats]);

  // Apply for leave
  const applyForLeave = useCallback(async (leaveData) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }
    setLoading(true);
    try {
      const result = await applyForLeaveService(user.employeeId, leaveData);
      if (result.success) {
        await refreshLeaveData();
      }
      return result;
    } catch (error) {
      console.error('Apply for leave error:', error);
      return { success: false, error: 'Failed to apply for leave' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, refreshLeaveData]);

  // Cancel leave application
  const cancelLeaveApplication = useCallback(async (applicationId) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Not authenticated' };
    }
    setLoading(true);
    try {
      const result = await cancelLeaveApplicationService(applicationId);
      if (result.success) {
        await refreshLeaveData();
      }
      return result;
    } catch (error) {
      console.error('Cancel leave application error:', error);
      return { success: false, error: 'Failed to cancel application' };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, refreshLeaveData]);

  // Check if user has sufficient leave balance
  const hasSufficientBalance = useCallback((leaveType, days) => {
    const balance = leaveBalances[leaveType]?.remaining || 0;
    return balance >= days;
  }, [leaveBalances]);

  // Get leave type color
  const getLeaveTypeColor = useCallback((leaveType) => {
    const colors = {
      CL: '#3B82F6', // Blue
      SL: '#F59E0B', // Orange
      EL: '#10B981', // Green
    };
    return colors[leaveType] || '#6B7280';
  }, []);

  // Get leave type name
  const getLeaveTypeName = useCallback((leaveType) => {
    const names = {
      CL: 'Casual Leave',
      SL: 'Sick Leave',
      EL: 'Earned Leave',
    };
    return names[leaveType] || leaveType;
  }, []);

  // Context value
  const value = {
    leaveBalances,
    leaveApplications,
    leaveHistory,
    leaveStats,
    loading,
    getLeaveBalances,
    applyForLeave,
    getLeaveApplications,
    cancelLeaveApplication,
    getLeaveHistory,
    getLeaveStats,
    syncLeaves,
    refreshLeaveData,
    hasSufficientBalance,
    getLeaveTypeColor,
    getLeaveTypeName,
  };

  return (
    <LeaveContext.Provider value={value}>
      {children}
    </LeaveContext.Provider>
  );
};

export default LeaveContext;
