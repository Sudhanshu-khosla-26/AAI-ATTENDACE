/**
 * AAI Attendance App - Authentication Context
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initializeSampleData,
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentSession,
  isAuthenticated as checkIsAuthenticated,
  generateOTP as generateOTPService,
  verifyOTP as verifyOTPService,
  resetPassword as resetPasswordService,
  changePassword as changePasswordService,
  updateProfile as updateProfileService,
  verifyEmail as verifyEmailService,
  verifyPhoto as verifyPhotoService,
  registerDevice as registerDeviceService,
  getDeviceInfo,
  isDeviceRegistered as checkDeviceRegistered,
  authenticateWithBiometrics,
  isBiometricRequired,
} from '../services/authService';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Initialize app data and check session
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize sample data
        await initializeSampleData();

        // Check for existing session
        const session = await getCurrentSession();
        if (session) {
          setUser(session);
          setIsAuthenticated(true);
        }

        // Check device registration
        const deviceReg = await checkDeviceRegistered();
        setIsDeviceRegistered(deviceReg);

        if (deviceReg) {
          const info = await getDeviceInfo();
          setDeviceInfo(info);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    };

    init();
  }, []);

  // Login function
  const login = useCallback(async (employeeId, password) => {
    setLoading(true);
    try {
      const result = await loginService(employeeId, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await registerService(userData);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, errors: { general: 'Registration failed' } };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const result = await logoutService();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
      }
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate OTP
  const generateOTP = useCallback(async (email) => {
    try {
      return await generateOTPService(email);
    } catch (error) {
      console.error('Generate OTP error:', error);
      return { success: false, error: 'Failed to generate OTP' };
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (otp) => {
    try {
      return await verifyOTPService(otp);
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: 'Failed to verify OTP' };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email, newPassword) => {
    try {
      return await resetPasswordService(email, newPassword);
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      return await changePasswordService(user.userId, oldPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const result = await updateProfileService(user.userId, updates);
      if (result.success) {
        // Update local user state
        setUser(prev => ({ ...prev, ...updates }));
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [user]);

  // Verify email
  const verifyEmail = useCallback(async () => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const result = await verifyEmailService(user.userId);
      if (result.success) {
        setUser(prev => ({ ...prev, isEmailVerified: true }));
      }
      return result;
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }, [user]);

  // Verify photo
  const verifyPhoto = useCallback(async (photoUri) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const result = await verifyPhotoService(user.userId, photoUri);
      if (result.success) {
        setUser(prev => ({ ...prev, isPhotoVerified: true }));
      }
      return result;
    } catch (error) {
      console.error('Verify photo error:', error);
      return { success: false, error: 'Failed to verify photo' };
    }
  }, [user]);

  // Register device
  const registerDevice = useCallback(async () => {
    try {
      const result = await registerDeviceService();
      if (result.success) {
        setIsDeviceRegistered(true);
        setDeviceInfo(result.deviceInfo);
      }
      return result;
    } catch (error) {
      console.error('Register device error:', error);
      return { success: false, error: 'Failed to register device' };
    }
  }, []);

  // Biometric authentication
  const biometricAuth = useCallback(async () => {
    try {
      return await authenticateWithBiometrics();
    } catch (error) {
      console.error('Biometric auth error:', error);
      return { success: false, error: 'Biometric authentication failed' };
    }
  }, []);

  // Check if biometric is required
  const checkBiometricRequired = useCallback(async () => {
    try {
      return await isBiometricRequired();
    } catch (error) {
      return true;
    }
  }, []);

  // Context value
  const value = {
    user,
    isAuthenticated,
    isDeviceRegistered,
    deviceInfo,
    loading,
    initializing,
    login,
    register,
    logout,
    generateOTP,
    verifyOTP,
    resetPassword,
    changePassword,
    updateProfile,
    verifyEmail,
    verifyPhoto,
    registerDevice,
    biometricAuth,
    checkBiometricRequired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
