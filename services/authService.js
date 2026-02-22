/**
 * AAI Attendance App - Authentication Service (API-connected)
 * All operations go through Next.js backend API
 */

import { API_ENDPOINTS } from '../constants/api';
import { api, storeToken, clearToken, getToken } from '../utils/apiClient';
import { storeData, getData, removeData } from '../utils/storageUtils';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const STORAGE_KEYS = {
  USER_SESSION: '@user_session',
  DEVICE_REGISTRATION: '@device_registration',
  LAST_AUTHENTICATION: '@last_authentication',
};

/**
 * Login user via API
 */
export const login = async (employeeId, password) => {
  try {
    const result = await api.post(API_ENDPOINTS.LOGIN, {
      employeeId: employeeId.trim().toUpperCase(),
      password,
    });

    if (result.success) {
      // Store JWT token
      await storeToken(result.token);

      // Create local session
      const session = {
        userId: result.user._id || result.user.id,
        employeeId: result.user.employeeId,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        department: result.user.department,
        designation: result.user.designation,
        location: result.user.locationId || result.user.location,
        locationCode: result.user.locationCode,
        role: result.user.role || 'employee',
        photoUrl: result.user.photoUrl,
        isEmailVerified: result.user.isEmailVerified,
        isPhotoVerified: result.user.isPhotoVerified,
        loginTime: new Date().toISOString(),
      };

      await storeData(STORAGE_KEYS.USER_SESSION, session);

      return {
        success: true,
        user: session,
        token: result.token,
      };
    }

    return {
      success: false,
      error: result.error || result.message || 'Login failed',
    };
  } catch (error) {
    console.error('[authService] login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
};

/**
 * Register new user via API
 */
export const register = async (userData) => {
  try {
    const result = await api.post(API_ENDPOINTS.REGISTER, {
      employeeId: userData.employeeId?.trim().toUpperCase(),
      fullName: userData.fullName?.trim(),
      email: userData.email?.trim().toLowerCase(),
      phone: userData.phone?.trim(),
      department: userData.department,
      designation: userData.designation,
      locationId: userData.locationId || userData.location,
      password: userData.password,
    });

    if (result.success) {
      return {
        success: true,
        message: result.message || 'Registration successful! Awaiting admin approval.',
        userId: result.user?._id || result.userId,
      };
    }

    return {
      success: false,
      error: result.error || result.message || 'Registration failed',
      errors: result.errors || {},
    };
  } catch (error) {
    console.error('[authService] register error:', error);
    return { success: false, errors: { general: 'Registration failed. Try again.' } };
  }
};

/**
 * Logout - clears token and local session
 */
export const logout = async () => {
  try {
    // Call API logout (invalidate server-side if needed)
    await api.post(API_ENDPOINTS.LOGOUT, {}).catch(() => { }); // ignore failure

    // Clear local storage
    await clearToken();
    await removeData(STORAGE_KEYS.USER_SESSION);
    await removeData(STORAGE_KEYS.LAST_AUTHENTICATION);

    return { success: true };
  } catch (error) {
    console.error('[authService] logout error:', error);
    return { success: false, error: 'Error during logout' };
  }
};

/**
 * Get current session from local storage
 */
export const getCurrentSession = async () => {
  try {
    const session = await getData(STORAGE_KEYS.USER_SESSION, null);
    if (!session) return null;

    // Optionally verify token still valid
    const token = await getToken();
    if (!token) return null;

    return session;
  } catch (error) {
    console.error('[authService] getCurrentSession error:', error);
    return null;
  }
};

/**
 * Refresh session from server
 */
export const refreshSession = async () => {
  try {
    const result = await api.get(API_ENDPOINTS.ME);
    if (result.success && result.user) {
      const session = {
        userId: result.user._id || result.user.id,
        employeeId: result.user.employeeId,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        department: result.user.department,
        designation: result.user.designation,
        location: result.user.locationId?._id || result.user.locationId || result.user.location,
        locationCode: result.user.locationId?.code || result.user.locationCode,
        locationName: result.user.locationId?.name || result.user.locationName,
        role: result.user.role,
        photoUrl: result.user.photoUrl,
        isEmailVerified: result.user.isEmailVerified,
        isPhotoVerified: result.user.isPhotoVerified,
      };
      await storeData(STORAGE_KEYS.USER_SESSION, session);
      return session;
    }
    return null;
  } catch (error) {
    console.error('[authService] refreshSession error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has valid token + session)
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return session !== null;
};

/**
 * Generate OTP via API (forgot password)
 */
export const generateOTP = async (email) => {
  try {
    const result = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  } catch (error) {
    console.error('[authService] generateOTP error:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
};

/**
 * Verify OTP via API
 */
export const verifyOTP = async (email, otp) => {
  try {
    const result = await api.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
    return {
      success: result.success,
      message: result.message,
      error: result.error,
      email: result.email || email,
    };
  } catch (error) {
    console.error('[authService] verifyOTP error:', error);
    return { success: false, error: 'Failed to verify OTP' };
  }
};

/**
 * Reset password via API
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const result = await api.post(API_ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword });
    return {
      success: result.success,
      message: result.message,
      error: result.error,
    };
  } catch (error) {
    console.error('[authService] resetPassword error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
};

/**
 * Update user profile via API
 */
export const updateProfile = async (userId, updates) => {
  try {
    const result = await api.patch(`/api/users/${userId}`, updates);
    if (result.success) {
      // Update local session
      const session = await getData(STORAGE_KEYS.USER_SESSION, null);
      if (session) {
        const updatedSession = { ...session, ...updates };
        await storeData(STORAGE_KEYS.USER_SESSION, updatedSession);
      }
    }
    return result;
  } catch (error) {
    console.error('[authService] updateProfile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
};

/**
 * Register device info
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
    return { success: true, deviceInfo };
  } catch (error) {
    console.error('[authService] registerDevice error:', error);
    return { success: false, error: 'Error registering device' };
  }
};

export const getDeviceInfo = async () => {
  try {
    return await getData(STORAGE_KEYS.DEVICE_REGISTRATION, null);
  } catch (error) {
    return null;
  }
};

export const isDeviceRegistered = async () => {
  const info = await getDeviceInfo();
  return info !== null;
};

/**
 * Biometric authentication
 */
export const authenticateWithBiometrics = async () => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return { success: false, error: 'Biometric not available' };

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return { success: false, error: 'No biometric credentials enrolled' };

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access AAI Attendance',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      await storeData(STORAGE_KEYS.LAST_AUTHENTICATION, Date.now());
    }

    return result;
  } catch (error) {
    console.error('[authService] biometric error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export const isBiometricRequired = async () => {
  try {
    const lastAuth = await getData(STORAGE_KEYS.LAST_AUTHENTICATION, 0);
    const timeout = 5 * 60 * 1000;
    return Date.now() - lastAuth > timeout;
  } catch {
    return true;
  }
};

// Legacy aliases
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const result = await api.post('/api/auth/change-password', { oldPassword, newPassword });
    return result;
  } catch (error) {
    return { success: false, error: 'Failed to change password' };
  }
};

export const verifyEmail = async (userId) => {
  return { success: true }; // handled via OTP flow
};

export const verifyPhoto = async (userId, photoUri) => {
  return { success: true }; // handled via face verification
};

export const initializeSampleData = async () => {
  // No longer needed - backend handles data
  return;
};

export default {
  login,
  register,
  logout,
  getCurrentSession,
  refreshSession,
  isAuthenticated,
  generateOTP,
  verifyOTP,
  resetPassword,
  changePassword,
  updateProfile,
  registerDevice,
  getDeviceInfo,
  isDeviceRegistered,
  authenticateWithBiometrics,
  isBiometricRequired,
  initializeSampleData,
  verifyEmail,
  verifyPhoto,
};
