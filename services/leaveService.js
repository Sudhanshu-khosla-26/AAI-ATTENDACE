/**
 * AAI Attendance App - Leave Service
 * Handles leave applications, balances, and management
 */

import { STORAGE_KEYS, LEAVE_CONFIG } from '../constants/config';
import { storeData, getData, updateInArray } from '../utils/storageUtils';
import { getWorkingDays, formatDate } from '../utils/dateUtils';
import { validateLeaveApplication } from '../utils/validationUtils';

/**
 * Get leave balances for an employee
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Leave balances
 */
export const getLeaveBalances = async (employeeId) => {
  try {
    const allBalances = await getData(STORAGE_KEYS.LEAVE_BALANCES, {});
    const userBalances = allBalances[employeeId];

    if (!userBalances) {
      // Initialize default balances
      const defaultBalances = {
        CL: { total: 15, used: 0, remaining: 15 },
        SL: { total: 12, used: 0, remaining: 12 },
        EL: { total: 15, used: 0, remaining: 15 },
      };
      
      allBalances[employeeId] = defaultBalances;
      await storeData(STORAGE_KEYS.LEAVE_BALANCES, allBalances);
      
      return defaultBalances;
    }

    return userBalances;
  } catch (error) {
    console.error('Get leave balances error:', error);
    return LEAVE_CONFIG.defaultBalances;
  }
};

/**
 * Apply for leave
 * @param {string} employeeId - Employee ID
 * @param {Object} leaveData - Leave application data
 * @returns {Promise<Object>} Application result
 */
export const applyForLeave = async (employeeId, leaveData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get leave balances
    const leaveBalances = await getLeaveBalances(employeeId);

    // Calculate number of days
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const numberOfDays = getWorkingDays(startDate, endDate);

    const applicationData = {
      ...leaveData,
      numberOfDays,
    };

    // Validate application
    const validation = validateLeaveApplication(applicationData, leaveBalances);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Check for overlapping leaves
    const hasOverlap = await checkOverlappingLeaves(
      employeeId,
      leaveData.startDate,
      leaveData.endDate
    );

    if (hasOverlap) {
      return {
        success: false,
        errors: {
          dateRange: 'You already have a leave application for these dates',
        },
      };
    }

    // Create leave application
    const application = {
      id: `LEV${Date.now()}`,
      employeeId,
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      numberOfDays,
      reason: leaveData.reason,
      documents: leaveData.documents || [],
      status: 'pending',
      appliedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    // Save application
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    applications.push(application);
    await storeData(STORAGE_KEYS.LEAVE_APPLICATIONS, applications);

    // Add to sync queue
    await addToSyncQueue({
      type: 'leave',
      action: 'apply',
      data: application,
    });

    return {
      success: true,
      message: 'Leave application submitted successfully',
      application,
    };
  } catch (error) {
    console.error('Apply for leave error:', error);
    return {
      success: false,
      errors: {
        general: 'Error submitting leave application. Please try again.',
      },
    };
  }
};

/**
 * Check for overlapping leave dates
 * @param {string} employeeId - Employee ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<boolean>} True if overlap exists
 */
const checkOverlappingLeaves = async (employeeId, startDate, endDate) => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    const userApplications = applications.filter(
      a => a.employeeId === employeeId && ['pending', 'approved'].includes(a.status)
    );

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return userApplications.some(app => {
      const appStart = new Date(app.startDate);
      const appEnd = new Date(app.endDate);

      return (
        (newStart >= appStart && newStart <= appEnd) ||
        (newEnd >= appStart && newEnd <= appEnd) ||
        (newStart <= appStart && newEnd >= appEnd)
      );
    });
  } catch (error) {
    console.error('Check overlapping leaves error:', error);
    return false;
  }
};

/**
 * Get leave applications for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Leave applications
 */
export const getLeaveApplications = async (employeeId, status = null) => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    let userApplications = applications.filter(a => a.employeeId === employeeId);

    if (status) {
      userApplications = userApplications.filter(a => a.status === status);
    }

    // Sort by applied date descending
    return userApplications.sort((a, b) => 
      new Date(b.appliedAt) - new Date(a.appliedAt)
    );
  } catch (error) {
    console.error('Get leave applications error:', error);
    return [];
  }
};

/**
 * Cancel leave application
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Cancel result
 */
export const cancelLeaveApplication = async (applicationId) => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    const appIndex = applications.findIndex(a => a.id === applicationId);

    if (appIndex === -1) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    if (applications[appIndex].status !== 'pending') {
      return {
        success: false,
        error: 'Only pending applications can be cancelled',
      };
    }

    applications[appIndex].status = 'cancelled';
    applications[appIndex].cancelledAt = new Date().toISOString();

    await storeData(STORAGE_KEYS.LEAVE_APPLICATIONS, applications);

    return {
      success: true,
      message: 'Application cancelled successfully',
    };
  } catch (error) {
    console.error('Cancel leave application error:', error);
    return {
      success: false,
      error: 'Error cancelling application',
    };
  }
};

/**
 * Get leave history with filters
 * @param {string} employeeId - Employee ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Grouped leave history
 */
export const getLeaveHistory = async (employeeId, filters = {}) => {
  try {
    const applications = await getLeaveApplications(employeeId);

    // Group by status
    const grouped = {
      pending: applications.filter(a => a.status === 'pending'),
      approved: applications.filter(a => a.status === 'approved'),
      rejected: applications.filter(a => a.status === 'rejected'),
      cancelled: applications.filter(a => a.status === 'cancelled'),
    };

    // Apply filters
    if (filters.leaveType) {
      Object.keys(grouped).forEach(key => {
        grouped[key] = grouped[key].filter(a => a.leaveType === filters.leaveType);
      });
    }

    if (filters.year) {
      Object.keys(grouped).forEach(key => {
        grouped[key] = grouped[key].filter(a => {
          const appYear = new Date(a.startDate).getFullYear();
          return appYear === filters.year;
        });
      });
    }

    return grouped;
  } catch (error) {
    console.error('Get leave history error:', error);
    return {
      pending: [],
      approved: [],
      rejected: [],
      cancelled: [],
    };
  }
};

/**
 * Get leave statistics
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} Leave statistics
 */
export const getLeaveStats = async (employeeId) => {
  try {
    const balances = await getLeaveBalances(employeeId);
    const applications = await getLeaveApplications(employeeId);

    const approvedLeaves = applications.filter(a => a.status === 'approved');
    const pendingLeaves = applications.filter(a => a.status === 'pending');
    const rejectedLeaves = applications.filter(a => a.status === 'rejected');

    const totalApprovedDays = approvedLeaves.reduce(
      (sum, a) => sum + a.numberOfDays, 
      0
    );

    return {
      balances,
      totalApplications: applications.length,
      approvedCount: approvedLeaves.length,
      pendingCount: pendingLeaves.length,
      rejectedCount: rejectedLeaves.length,
      totalApprovedDays,
    };
  } catch (error) {
    console.error('Get leave stats error:', error);
    return {
      balances: LEAVE_CONFIG.defaultBalances,
      totalApplications: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      totalApprovedDays: 0,
    };
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
 * Sync pending leave applications
 * @returns {Promise<Object>} Sync result
 */
export const syncLeaves = async () => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    const pendingApplications = applications.filter(a => a.syncStatus === 'pending');

    if (pendingApplications.length === 0) {
      return {
        success: true,
        synced: 0,
        message: 'All leave applications are up to date',
      };
    }

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark applications as synced
    const updatedApplications = applications.map(a => {
      if (a.syncStatus === 'pending') {
        return { ...a, syncStatus: 'synced', syncedAt: new Date().toISOString() };
      }
      return a;
    });

    await storeData(STORAGE_KEYS.LEAVE_APPLICATIONS, updatedApplications);

    // Update sync queue
    const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
    const updatedQueue = queue.filter(item => 
      !(item.type === 'leave' && pendingApplications.some(a => a.id === item.data.id))
    );
    await storeData(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);

    return {
      success: true,
      synced: pendingApplications.length,
      message: `${pendingApplications.length} leave application(s) synced successfully`,
    };
  } catch (error) {
    console.error('Sync leaves error:', error);
    return {
      success: false,
      error: 'Error syncing leave applications',
    };
  }
};

/**
 * Admin: Approve leave application
 * @param {string} applicationId - Application ID
 * @param {string} approverName - Approver name
 * @param {string} comments - Approval comments
 * @returns {Promise<Object>} Approval result
 */
export const approveLeave = async (applicationId, approverName, comments = '') => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    const appIndex = applications.findIndex(a => a.id === applicationId);

    if (appIndex === -1) {
      return { success: false, error: 'Application not found' };
    }

    if (applications[appIndex].status !== 'pending') {
      return { success: false, error: 'Application is not pending' };
    }

    // Update application
    applications[appIndex].status = 'approved';
    applications[appIndex].approvedAt = new Date().toISOString();
    applications[appIndex].approverName = approverName;
    applications[appIndex].comments = comments;

    await storeData(STORAGE_KEYS.LEAVE_APPLICATIONS, applications);

    // Update leave balance
    const employeeId = applications[appIndex].employeeId;
    const leaveType = applications[appIndex].leaveType;
    const days = applications[appIndex].numberOfDays;

    const allBalances = await getData(STORAGE_KEYS.LEAVE_BALANCES, {});
    if (allBalances[employeeId] && allBalances[employeeId][leaveType]) {
      allBalances[employeeId][leaveType].used += days;
      allBalances[employeeId][leaveType].remaining -= days;
      await storeData(STORAGE_KEYS.LEAVE_BALANCES, allBalances);
    }

    return {
      success: true,
      message: 'Leave application approved',
    };
  } catch (error) {
    console.error('Approve leave error:', error);
    return { success: false, error: 'Error approving leave' };
  }
};

/**
 * Admin: Reject leave application
 * @param {string} applicationId - Application ID
 * @param {string} approverName - Approver name
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Rejection result
 */
export const rejectLeave = async (applicationId, approverName, reason = '') => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    const appIndex = applications.findIndex(a => a.id === applicationId);

    if (appIndex === -1) {
      return { success: false, error: 'Application not found' };
    }

    if (applications[appIndex].status !== 'pending') {
      return { success: false, error: 'Application is not pending' };
    }

    applications[appIndex].status = 'rejected';
    applications[appIndex].rejectedAt = new Date().toISOString();
    applications[appIndex].approverName = approverName;
    applications[appIndex].rejectionReason = reason;

    await storeData(STORAGE_KEYS.LEAVE_APPLICATIONS, applications);

    return {
      success: true,
      message: 'Leave application rejected',
    };
  } catch (error) {
    console.error('Reject leave error:', error);
    return { success: false, error: 'Error rejecting leave' };
  }
};

/**
 * Get all pending leave applications (for admin)
 * @returns {Promise<Array>} Pending applications
 */
export const getAllPendingApplications = async () => {
  try {
    const applications = await getData(STORAGE_KEYS.LEAVE_APPLICATIONS, []);
    return applications
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
  } catch (error) {
    console.error('Get all pending applications error:', error);
    return [];
  }
};

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
  getAllPendingApplications,
};
