/**
 * AAI Attendance App - Leave Service (API-connected)
 * All leave operations go through Next.js backend API
 */

import { API_ENDPOINTS } from '../constants/api';
import { api } from '../utils/apiClient';

/**
 * Get leave balances from API
 */
export const getLeaveBalances = async () => {
  try {
    const result = await api.get(API_ENDPOINTS.LEAVE_BALANCE);
    if (result.success) {
      return result.balances || result.data || {
        CL: { total: 15, used: 0, remaining: 15 },
        SL: { total: 12, used: 0, remaining: 12 },
        EL: { total: 15, used: 0, remaining: 15 },
      };
    }
    return getDefaultBalances();
  } catch (error) {
    console.error('[leaveService] getLeaveBalances:', error);
    return getDefaultBalances();
  }
};

const getDefaultBalances = () => ({
  CL: { total: 15, used: 0, remaining: 15 },
  SL: { total: 12, used: 0, remaining: 12 },
  EL: { total: 15, used: 0, remaining: 15 },
});

/**
 * Apply for leave via API
 */
export const applyForLeave = async (leaveData) => {
  try {
    const result = await api.post(API_ENDPOINTS.LEAVE_APPLY, {
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      reason: leaveData.reason,
    });

    return {
      success: result.success,
      message: result.message,
      application: result.application || result.leave,
      error: result.error,
      errors: result.errors,
    };
  } catch (error) {
    console.error('[leaveService] applyForLeave:', error);
    return { success: false, errors: { general: 'Error submitting leave. Try again.' } };
  }
};

/**
 * Get leave applications from API
 */
export const getLeaveApplications = async (status = null, page = 1) => {
  try {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);

    const result = await api.get(`${API_ENDPOINTS.LEAVES}?${params}`);
    if (result.success) {
      return result.leaves || result.applications || [];
    }
    return [];
  } catch (error) {
    console.error('[leaveService] getLeaveApplications:', error);
    return [];
  }
};

/**
 * Cancel leave application via API
 */
export const cancelLeaveApplication = async (applicationId) => {
  try {
    const result = await api.patch(API_ENDPOINTS.LEAVE_CANCEL(applicationId), {});
    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  } catch (error) {
    console.error('[leaveService] cancelLeaveApplication:', error);
    return { success: false, error: 'Error cancelling leave' };
  }
};

/**
 * Get leave history (grouped)
 */
export const getLeaveHistory = async (filters = {}) => {
  try {
    const applications = await getLeaveApplications();

    const grouped = {
      pending: applications.filter(a => (a.status || '').toUpperCase() === 'PENDING'),
      approved: applications.filter(a => (a.status || '').toUpperCase() === 'APPROVED'),
      rejected: applications.filter(a => (a.status || '').toUpperCase() === 'REJECTED'),
      cancelled: applications.filter(a => (a.status || '').toUpperCase() === 'CANCELLED'),
    };

    if (filters.leaveType) {
      Object.keys(grouped).forEach(key => {
        grouped[key] = grouped[key].filter(a => a.leaveType === filters.leaveType);
      });
    }

    return grouped;
  } catch (error) {
    console.error('[leaveService] getLeaveHistory:', error);
    return { pending: [], approved: [], rejected: [], cancelled: [] };
  }
};

/**
 * Get leave stats
 */
export const getLeaveStats = async () => {
  try {
    const [balances, applications] = await Promise.all([
      getLeaveBalances(),
      getLeaveApplications(),
    ]);

    const approved = applications.filter(a => (a.status || '').toUpperCase() === 'APPROVED');
    const pending = applications.filter(a => (a.status || '').toUpperCase() === 'PENDING');
    const rejected = applications.filter(a => (a.status || '').toUpperCase() === 'REJECTED');

    return {
      balances,
      totalApplications: applications.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      totalApprovedDays: approved.reduce((s, a) => s + (a.numberOfDays || 0), 0),
    };
  } catch (error) {
    console.error('[leaveService] getLeaveStats:', error);
    return {
      balances: getDefaultBalances(),
      totalApplications: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      totalApprovedDays: 0,
    };
  }
};

/**
 * Admin: Approve leave
 */
export const approveLeave = async (applicationId, comments = '') => {
  try {
    const result = await api.patch(`/api/leaves/${applicationId}/approve`, { comments });
    return { success: result.success, message: result.message, error: result.error };
  } catch (error) {
    return { success: false, error: 'Error approving leave' };
  }
};

/**
 * Admin: Reject leave
 */
export const rejectLeave = async (applicationId, reason = '') => {
  try {
    const result = await api.patch(`/api/leaves/${applicationId}/reject`, { reason });
    return { success: result.success, message: result.message, error: result.error };
  } catch (error) {
    return { success: false, error: 'Error rejecting leave' };
  }
};

/**
 * Sync stubs (no longer needed, kept for compatibility)
 */
export const syncLeaves = async () => ({ success: true, synced: 0, message: 'Synced' });

export default {
  getLeaveBalances,
  applyForLeave,
  getLeaveApplications,
  cancelLeaveApplication,
  getLeaveHistory,
  getLeaveStats,
  syncLeaves,
  approveLeave,
  rejectLeave,
};
