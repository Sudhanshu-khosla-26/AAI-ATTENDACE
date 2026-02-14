/**
 * AAI Attendance App - Date Utility Functions
 */

import { format, parseISO, isValid, differenceInMinutes, differenceInHours, startOfDay, endOfDay, isWeekend, isSameDay, addDays, subDays, getDaysInMonth, getYear, getMonth, getDate } from 'date-fns';

/**
 * Format date to display string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr);
};

/**
 * Format time to display string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'hh:mm a')
 * @returns {string} Formatted time string
 */
export const formatTime = (date, formatStr = 'hh:mm a') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr);
};

/**
 * Format date and time together
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};

/**
 * Get current date in ISO format
 * @returns {string} Current date in ISO format
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Get today's date string for storage keys
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayKey = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Get month key for storage
 * @param {Date} date - Date object
 * @returns {string} Month key in YYYY-MM format
 */
export const getMonthKey = (date = new Date()) => {
  return format(date, 'yyyy-MM');
};

/**
 * Calculate duration between two times
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {string} Duration in hours and minutes
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '0h 0m';
  
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  if (!isValid(start) || !isValid(end)) return '0h 0m';
  
  const diffMinutes = differenceInMinutes(end, start);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

/**
 * Calculate total hours between two times
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {number} Total hours (decimal)
 */
export const calculateTotalHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  if (!isValid(start) || !isValid(end)) return 0;
  
  const diffHours = differenceInMinutes(end, start) / 60;
  return parseFloat(diffHours.toFixed(2));
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  return isSameDay(dateObj, new Date());
};

/**
 * Check if given time is within working hours
 * @param {Date} date - Date to check
 * @param {number} startHour - Working hours start (default: 6)
 * @param {number} endHour - Working hours end (default: 22)
 * @returns {boolean} True if within working hours
 */
export const isWithinWorkingHours = (date = new Date(), startHour = 6, endHour = 22) => {
  const hour = date.getHours();
  return hour >= startHour && hour <= endHour;
};

/**
 * Get working days in a date range (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of working days
 */
export const getWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  let workingDays = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return workingDays;
};

/**
 * Get calendar days for a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Array} Array of date objects
 */
export const getCalendarDays = (year, month) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const days = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, dateObj);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  
  const diffHours = differenceInHours(now, dateObj);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  return formatDate(dateObj);
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDaysToDate = (date, days) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  return dateObj < startOfDay(new Date());
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  return dateObj > endOfDay(new Date());
};

/**
 * Format duration in milliseconds to readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getCurrentDateISO,
  getTodayKey,
  getMonthKey,
  calculateDuration,
  calculateTotalHours,
  isToday,
  isWithinWorkingHours,
  getWorkingDays,
  getCalendarDays,
  getRelativeTime,
  parseDate,
  addDaysToDate,
  isPastDate,
  isFutureDate,
  formatDuration,
};
