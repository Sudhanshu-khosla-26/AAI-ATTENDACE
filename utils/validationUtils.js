/**
 * AAI Attendance App - Validation Utility Functions
 */

import { REGEX } from '../constants/config';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return REGEX.email.test(email.trim());
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s/g, '');
  return REGEX.phone.test(cleaned);
};

/**
 * Validate employee ID format
 * @param {string} employeeId - Employee ID to validate
 * @returns {boolean} True if valid
 */
export const isValidEmployeeId = (employeeId) => {
  if (!employeeId || typeof employeeId !== 'string') return false;
  return REGEX.employeeId.test(employeeId.trim().toUpperCase());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get password strength level
 * @param {string} password - Password to check
 * @returns {string} Strength level: 'weak', 'medium', 'strong'
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length < 6) return 'weak';
  
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if valid
 */
export const isRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - Value to check
 * @param {number} minLength - Minimum length
 * @returns {boolean} True if valid
 */
export const minLength = (value, minLength) => {
  if (!value || typeof value !== 'string') return false;
  return value.trim().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to check
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if valid
 */
export const maxLength = (value, maxLength) => {
  if (!value || typeof value !== 'string') return true;
  return value.trim().length <= maxLength;
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if valid
 */
export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate leave application
 * @param {Object} leaveData - Leave application data
 * @param {Object} leaveBalance - Current leave balance
 * @returns {Object} Validation result
 */
export const validateLeaveApplication = (leaveData, leaveBalance) => {
  const errors = {};
  
  // Check leave type
  if (!leaveData.leaveType) {
    errors.leaveType = 'Please select a leave type';
  }
  
  // Check dates
  if (!leaveData.startDate) {
    errors.startDate = 'Please select a start date';
  }
  
  if (!leaveData.endDate) {
    errors.endDate = 'Please select an end date';
  }
  
  if (leaveData.startDate && leaveData.endDate) {
    if (new Date(leaveData.startDate) > new Date(leaveData.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  // Check reason
  if (!leaveData.reason || leaveData.reason.trim().length === 0) {
    errors.reason = 'Please provide a reason for your leave';
  }
  
  if (leaveData.reason && leaveData.reason.trim().length < 10) {
    errors.reason = 'Reason must be at least 10 characters long';
  }
  
  // Check leave balance
  if (leaveData.leaveType && leaveData.numberOfDays) {
    const balance = leaveBalance?.[leaveData.leaveType]?.remaining || 0;
    if (leaveData.numberOfDays > balance) {
      errors.leaveType = `Insufficient leave balance. You have ${balance} days remaining.`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {Object} credentials - Login credentials
 * @returns {Object} Validation result
 */
export const validateLogin = (credentials) => {
  const errors = {};
  
  if (!credentials.employeeId || credentials.employeeId.trim().length === 0) {
    errors.employeeId = 'Employee ID is required';
  }
  
  if (!credentials.password || credentials.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate registration form
 * @param {Object} userData - User registration data
 * @returns {Object} Validation result
 */
export const validateRegistration = (userData) => {
  const errors = {};
  
  // Employee ID
  if (!userData.employeeId || userData.employeeId.trim().length === 0) {
    errors.employeeId = 'Employee ID is required';
  } else if (!isValidEmployeeId(userData.employeeId)) {
    errors.employeeId = 'Invalid Employee ID format (e.g., AA123456)';
  }
  
  // Full Name
  if (!userData.fullName || userData.fullName.trim().length === 0) {
    errors.fullName = 'Full name is required';
  } else if (userData.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  }
  
  // Email
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone
  if (!userData.phone || userData.phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(userData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  // Department
  if (!userData.department) {
    errors.department = 'Please select a department';
  }
  
  // Designation
  if (!userData.designation) {
    errors.designation = 'Please select a designation';
  }
  
  // Location
  if (!userData.location) {
    errors.location = 'Please select a location';
  }
  
  // Password
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  // Confirm Password
  if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Terms
  if (!userData.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate OTP
 * @param {string} otp - OTP to validate
 * @param {number} length - Expected length (default: 6)
 * @returns {boolean} True if valid
 */
export const isValidOTP = (otp, length = 6) => {
  if (!otp || typeof otp !== 'string') return false;
  const cleaned = otp.replace(/\s/g, '');
  return new RegExp(`^\\d{${length}}$`).test(cleaned);
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export default {
  isValidEmail,
  isValidPhone,
  isValidEmployeeId,
  validatePassword,
  getPasswordStrength,
  isRequired,
  minLength,
  maxLength,
  isValidDateRange,
  validateLeaveApplication,
  validateLogin,
  validateRegistration,
  isValidOTP,
  sanitizeInput,
};
