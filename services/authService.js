/**
 * AAI Attendance App - Authentication Service
 * Handles user authentication, registration, and session management
 */

import { STORAGE_KEYS, AIRPORT_LOCATIONS, DEPARTMENTS, DESIGNATIONS } from '../constants/config';
import { storeData, getData, removeData, updateInArray } from '../utils/storageUtils';
import { validateLogin, validateRegistration, isValidEmail, isValidPhone } from '../utils/validationUtils';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Initialize sample data on first app launch
 */
export const initializeSampleData = async () => {
  try {
    // Check if already initialized
    const isInitialized = await getData('@app_initialized', false);
    if (isInitialized) return;

    // Create sample admin user
    const sampleUser = {
      id: 'AA100001',
      employeeId: 'AA100001',
      fullName: 'Rajesh Kumar',
      email: 'rajesh.kumar@aai.aero',
      phone: '9876543210',
      department: 'OPS',
      designation: 'MANAGER',
      location: 'DEL',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true,
      isPhotoVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    // Create sample regular user
    const sampleUser2 = {
      id: 'AA100002',
      employeeId: 'AA100002',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@aai.aero',
      phone: '9876543211',
      department: 'ATC',
      designation: 'EXEC',
      location: 'BOM',
      password: 'User@123',
      role: 'employee',
      isEmailVerified: true,
      isPhotoVerified: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    // Store registered users
    await storeData(STORAGE_KEYS.REGISTERED_USERS, [sampleUser, sampleUser2]);

    // Initialize leave balances
    const leaveBalances = {
      'AA100001': {
        CL: { total: 15, used: 2, remaining: 13 },
        SL: { total: 12, used: 1, remaining: 11 },
        EL: { total: 15, used: 0, remaining: 15 },
      },
      'AA100002': {
        CL: { total: 15, used: 3, remaining: 12 },
        SL: { total: 12, used: 0, remaining: 12 },
        EL: { total: 15, used: 5, remaining: 10 },
      },
    };
    await storeData(STORAGE_KEYS.LEAVE_BALANCES, leaveBalances);

    // Initialize locations
    await storeData(STORAGE_KEYS.LOCATIONS, AIRPORT_LOCATIONS);

    // Mark as initialized
    await storeData('@app_initialized', true);

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

/**
 * Login user
 * @param {string} employeeId - Employee ID
 * @param {string} password - Password
 * @returns {Promise<Object>} Login result
 */
export const login = async (employeeId, password) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate input
    const validation = validateLogin({ employeeId, password });
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.employeeId || validation.errors.password,
      };
    }

    // Get registered users
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const user = users.find(u => u.employeeId === employeeId.trim().toUpperCase());

    if (!user) {
      return {
        success: false,
        error: 'Invalid Employee ID or Password',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Invalid Employee ID or Password',
      };
    }

    if (!user.isApproved) {
      return {
        success: false,
        error: 'Your account is pending admin approval. Please wait.',
      };
    }

    // Create session
    const session = {
      userId: user.id,
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      location: user.location,
      role: user.role || 'employee',
      isEmailVerified: user.isEmailVerified || false,
      isPhotoVerified: user.isPhotoVerified || false,
      loginTime: new Date().toISOString(),
    };

    await storeData(STORAGE_KEYS.USER_SESSION, session);

    return {
      success: true,
      user: session,
      requiresEmailVerification: !user.isEmailVerified,
      requiresPhotoVerification: !user.isPhotoVerified,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An error occurred during login. Please try again.',
    };
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
export const register = async (userData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validate input
    const validation = validateRegistration(userData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Get existing users
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);

    // Check if employee ID already exists
    if (users.some(u => u.employeeId === userData.employeeId.trim().toUpperCase())) {
      return {
        success: false,
        errors: { employeeId: 'Employee ID already registered' },
      };
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase())) {
      return {
        success: false,
        errors: { email: 'Email already registered' },
      };
    }

    // Create new user
    const newUser = {
      id: `AA${Date.now().toString().slice(-6)}`,
      employeeId: userData.employeeId.trim().toUpperCase(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      department: userData.department,
      designation: userData.designation,
      location: userData.location,
      password: userData.password,
      role: 'employee',
      isEmailVerified: false,
      isPhotoVerified: false,
      isApproved: false, // Requires admin approval
      createdAt: new Date().toISOString(),
    };

    // Add to users array
    users.push(newUser);
    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    // Initialize leave balances for new user
    const leaveBalances = await getData(STORAGE_KEYS.LEAVE_BALANCES, {});
    leaveBalances[newUser.employeeId] = {
      CL: { total: 15, used: 0, remaining: 15 },
      SL: { total: 12, used: 0, remaining: 12 },
      EL: { total: 15, used: 0, remaining: 15 },
    };
    await storeData(STORAGE_KEYS.LEAVE_BALANCES, leaveBalances);

    return {
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      userId: newUser.id,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      errors: { general: 'An error occurred during registration. Please try again.' },
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout result
 */
export const logout = async () => {
  try {
    await removeData(STORAGE_KEYS.USER_SESSION);
    await removeData(STORAGE_KEYS.LAST_AUTHENTICATION);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error during logout' };
  }
};

/**
 * Get current session
 * @returns {Promise<Object|null>} Current session or null
 */
export const getCurrentSession = async () => {
  try {
    return await getData(STORAGE_KEYS.USER_SESSION, null);
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return session !== null;
};

/**
 * Generate and store OTP
 * @param {string} email - Email address
 * @returns {Promise<Object>} OTP result
 */
export const generateOTP = async (email) => {
  try {
    // Validate email
    if (!isValidEmail(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Check if email exists
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'Email not found' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiry (15 minutes)
    const otpData = {
      email: email.toLowerCase(),
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      attempts: 0,
    };

    await storeData('@otp_verification', otpData);

    // For demo purposes, log OTP to console
    console.log(`OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: 'OTP sent successfully',
      // For demo only - remove in production
      demoOtp: otp,
    };
  } catch (error) {
    console.error('Generate OTP error:', error);
    return { success: false, error: 'Error generating OTP' };
  }
};

/**
 * Verify OTP
 * @param {string} otp - OTP to verify
 * @returns {Promise<Object>} Verification result
 */
export const verifyOTP = async (otp) => {
  try {
    const otpData = await getData('@otp_verification', null);

    if (!otpData) {
      return { success: false, error: 'OTP expired. Please request a new one.' };
    }

    if (Date.now() > otpData.expiresAt) {
      await removeData('@otp_verification');
      return { success: false, error: 'OTP expired. Please request a new one.' };
    }

    if (otpData.attempts >= 3) {
      await removeData('@otp_verification');
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (otpData.otp !== otp.trim()) {
      otpData.attempts++;
      await storeData('@otp_verification', otpData);
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    // OTP verified - clean up
    await removeData('@otp_verification');

    return {
      success: true,
      email: otpData.email,
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, error: 'Error verifying OTP' };
  }
};

/**
 * Reset password
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset result
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    users[userIndex].password = newPassword;
    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Error resetting password' };
  }
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Change result
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    if (users[userIndex].password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    users[userIndex].password = newPassword;
    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Error changing password' };
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Update result
 */
export const updateProfile = async (userId, updates) => {
  try {
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Update allowed fields
    const allowedFields = ['fullName', 'phone', 'email'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        users[userIndex][field] = updates[field];
      }
    });

    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    // Update session if exists
    const session = await getCurrentSession();
    if (session && session.userId === userId) {
      const updatedSession = { ...session, ...updates };
      await storeData(STORAGE_KEYS.USER_SESSION, updatedSession);
    }

    return { success: true, user: users[userIndex] };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Error updating profile' };
  }
};

/**
 * Verify email
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Verification result
 */
export const verifyEmail = async (userId) => {
  try {
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    users[userIndex].isEmailVerified = true;
    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    // Update session
    const session = await getCurrentSession();
    if (session && session.userId === userId) {
      session.isEmailVerified = true;
      await storeData(STORAGE_KEYS.USER_SESSION, session);
    }

    return { success: true };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, error: 'Error verifying email' };
  }
};

/**
 * Verify photo
 * @param {string} userId - User ID
 * @param {string} photoUri - Photo URI
 * @returns {Promise<Object>} Verification result
 */
export const verifyPhoto = async (userId, photoUri) => {
  try {
    const users = await getData(STORAGE_KEYS.REGISTERED_USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    users[userIndex].isPhotoVerified = true;
    users[userIndex].profilePhoto = photoUri;
    await storeData(STORAGE_KEYS.REGISTERED_USERS, users);

    // Store photo separately
    await storeData(STORAGE_KEYS.USER_PROFILE_PHOTO, {
      userId,
      photoUri,
      verifiedAt: new Date().toISOString(),
    });

    // Update session
    const session = await getCurrentSession();
    if (session && session.userId === userId) {
      session.isPhotoVerified = true;
      await storeData(STORAGE_KEYS.USER_SESSION, session);
    }

    return { success: true };
  } catch (error) {
    console.error('Verify photo error:', error);
    return { success: false, error: 'Error verifying photo' };
  }
};

/**
 * Register device
 * @returns {Promise<Object>} Registration result
 */
export const registerDevice = async () => {
  try {
    const deviceInfo = {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceType: Device.deviceType,
      uniqueId: Constants.installationId || Date.now().toString(),
      registeredAt: new Date().toISOString(),
    };

    await storeData(STORAGE_KEYS.DEVICE_REGISTRATION, deviceInfo);

    return {
      success: true,
      deviceInfo,
    };
  } catch (error) {
    console.error('Register device error:', error);
    return { success: false, error: 'Error registering device' };
  }
};

/**
 * Get device registration info
 * @returns {Promise<Object|null>} Device info or null
 */
export const getDeviceInfo = async () => {
  try {
    return await getData(STORAGE_KEYS.DEVICE_REGISTRATION, null);
  } catch (error) {
    console.error('Get device info error:', error);
    return null;
  }
};

/**
 * Check if device is registered
 * @returns {Promise<boolean>} True if registered
 */
export const isDeviceRegistered = async () => {
  const deviceInfo = await getDeviceInfo();
  return deviceInfo !== null;
};

/**
 * Authenticate with biometrics
 * @returns {Promise<Object>} Authentication result
 */
export const authenticateWithBiometrics = async () => {
  try {
    // Check if device supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { success: false, error: 'Biometric authentication not available' };
    }

    // Check if biometrics are enrolled
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return { success: false, error: 'No biometric credentials enrolled' };
    }

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access AAI Attendance',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Store last authentication time
      await storeData(STORAGE_KEYS.LAST_AUTHENTICATION, Date.now());
    }

    return result;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

/**
 * Check if biometric authentication is required
 * @returns {Promise<boolean>} True if required
 */
export const isBiometricRequired = async () => {
  try {
    const lastAuth = await getData(STORAGE_KEYS.LAST_AUTHENTICATION, 0);
    const timeout = 5 * 60 * 1000; // 5 minutes
    return Date.now() - lastAuth > timeout;
  } catch (error) {
    return true;
  }
};

export default {
  initializeSampleData,
  login,
  register,
  logout,
  getCurrentSession,
  isAuthenticated,
  generateOTP,
  verifyOTP,
  resetPassword,
  changePassword,
  updateProfile,
  verifyEmail,
  verifyPhoto,
  registerDevice,
  getDeviceInfo,
  isDeviceRegistered,
  authenticateWithBiometrics,
  isBiometricRequired,
};
