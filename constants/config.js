/**
 * AAI Attendance App - Configuration Constants
 */

// App Information
export const APP_INFO = {
  name: 'AAI Attendance',
  fullName: 'Airport Authority of India - Secure Attendance System',
  version: '1.0.0',
  buildNumber: '100',
  copyright: '© 2024 Airport Authority of India',
  governmentNotice: 'Authorized Personnel Only - Government of India',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_SESSION: '@user_session',
  USER_PROFILE_PHOTO: '@user_profile_photo',
  DEVICE_REGISTRATION: '@device_registration',
  ATTENDANCE_RECORDS: '@attendance_records',
  LEAVE_BALANCES: '@leave_balances',
  LEAVE_APPLICATIONS: '@leave_applications',
  SYNC_QUEUE: '@sync_queue',
  APP_SETTINGS: '@app_settings',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  REGISTERED_USERS: '@registered_users',
  LOCATIONS: '@locations',
  LAST_SYNC: '@last_sync',
  BIOMETRIC_LOCK_ENABLED: '@biometric_lock_enabled',
  LAST_AUTHENTICATION: '@last_authentication',
};

// Attendance Configuration
export const ATTENDANCE_CONFIG = {
  // Geofence radius in meters
  defaultGeofenceRadius: 200,
  
  // Working hours (24-hour format)
  workingHours: {
    start: 6,   // 6 AM
    end: 22,    // 10 PM
  },
  
  // Biometric lock timeout in minutes
  biometricTimeout: 5,
  
  // Auto-logout options in minutes
  autoLogoutOptions: [
    { label: 'Never', value: 0 },
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
  ],
  
  // Default auto-logout
  defaultAutoLogout: 15,
};

// Leave Configuration
export const LEAVE_CONFIG = {
  types: [
    { id: 'CL', name: 'Casual Leave', color: '#3B82F6', icon: 'beach' },
    { id: 'SL', name: 'Sick Leave', color: '#F59E0B', icon: 'medical-bag' },
    { id: 'EL', name: 'Earned Leave', color: '#10B981', icon: 'calendar-check' },
  ],
  defaultBalances: {
    CL: { total: 15, used: 0 },
    SL: { total: 12, used: 0 },
    EL: { total: 15, used: 0 },
  },
  maxReasonLength: 200,
};

// Departments
export const DEPARTMENTS = [
  { id: 'ATC', name: 'Air Traffic Control' },
  { id: 'ENG', name: 'Engineering' },
  { id: 'OPS', name: 'Operations' },
  { id: 'SEC', name: 'Security' },
  { id: 'ADM', name: 'Administration' },
  { id: 'FIN', name: 'Finance' },
  { id: 'HR', name: 'Human Resources' },
  { id: 'IT', name: 'Information Technology' },
];

// Designations
export const DESIGNATIONS = [
  { id: 'EXEC', name: 'Executive' },
  { id: 'MANAGER', name: 'Manager' },
  { id: 'DGM', name: 'Deputy General Manager' },
  { id: 'GM', name: 'General Manager' },
  { id: 'ED', name: 'Executive Director' },
  { id: 'CHAIRMAN', name: 'Chairman' },
];

// Airport Locations with coordinates
export const AIRPORT_LOCATIONS = [
  { 
    id: 'DEL', 
    name: 'Indira Gandhi International Airport', 
    code: 'DEL',
    latitude: 28.5562,
    longitude: 77.1000,
    radius: 500,
  },
  { 
    id: 'BOM', 
    name: 'Chhatrapati Shivaji Maharaj International Airport', 
    code: 'BOM',
    latitude: 19.0896,
    longitude: 72.8656,
    radius: 500,
  },
  { 
    id: 'MAA', 
    name: 'Chennai International Airport', 
    code: 'MAA',
    latitude: 12.9941,
    longitude: 80.1709,
    radius: 400,
  },
  { 
    id: 'BLR', 
    name: 'Kempegowda International Airport', 
    code: 'BLR',
    latitude: 13.1986,
    longitude: 77.7066,
    radius: 500,
  },
  { 
    id: 'HYD', 
    name: 'Rajiv Gandhi International Airport', 
    code: 'HYD',
    latitude: 17.2403,
    longitude: 78.4294,
    radius: 400,
  },
  { 
    id: 'CCU', 
    name: 'Netaji Subhas Chandra Bose International Airport', 
    code: 'CCU',
    latitude: 22.6547,
    longitude: 88.4467,
    radius: 400,
  },
];

// Sync Configuration
export const SYNC_CONFIG = {
  // Sync frequencies
  frequencies: [
    { label: 'Manual', value: 'manual' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ],
  defaultFrequency: 'daily',
  
  // Retry attempts for failed sync
  maxRetryAttempts: 3,
  
  // Retry delay in milliseconds
  retryDelay: 5000,
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ATTENDANCE_REMINDER: 'attendance_reminder',
  LEAVE_APPROVAL: 'leave_approval',
  SYNC_COMPLETE: 'sync_complete',
  ATTENDANCE_MARKED: 'attendance_marked',
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Regex Patterns
export const REGEX = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[6-9]\d{9}$/,
  employeeId: /^[A-Z]{2,3}\d{4,6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

export default {
  APP_INFO,
  STORAGE_KEYS,
  ATTENDANCE_CONFIG,
  LEAVE_CONFIG,
  DEPARTMENTS,
  DESIGNATIONS,
  AIRPORT_LOCATIONS,
  SYNC_CONFIG,
  NOTIFICATION_TYPES,
  ANIMATION_DURATION,
  REGEX,
};
