/**
 * AAI Attendance App - Authentication Context (API-connected)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentSession,
  refreshSession,
  isAuthenticated as checkIsAuthenticated,
  generateOTP as generateOTPService,
  verifyOTP as verifyOTPService,
  resetPassword as resetPasswordService,
  changePassword as changePasswordService,
  updateProfile as updateProfileService,
  registerDevice as registerDeviceService,
  getDeviceInfo,
  isDeviceRegistered as checkDeviceRegistered,
  authenticateWithBiometrics,
  isBiometricRequired,
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Initialize - check for existing session
  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing local session
        const session = await getCurrentSession();
        if (session) {
          setUser(session);
          setIsAuthenticated(true);

          // Try refreshing from server in background
          refreshSession().then(freshSession => {
            if (freshSession) {
              setUser(freshSession);
            }
          }).catch(() => { });
        }

        // Check device registration
        const deviceReg = await checkDeviceRegistered();
        setIsDeviceRegistered(deviceReg);
        if (deviceReg) {
          const info = await getDeviceInfo();
          setDeviceInfo(info);
        }
      } catch (error) {
        console.error('[AuthContext] init error:', error);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    };

    init();
  }, []);

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
      console.error('[AuthContext] login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await registerService(userData);
      return result;
    } catch (error) {
      console.error('[AuthContext] register error:', error);
      return { success: false, errors: { general: 'Registration failed' } };
    } finally {
      setLoading(false);
    }
  }, []);

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
      console.error('[AuthContext] logout error:', error);
      return { success: false, error: 'Logout failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateOTP = useCallback(async (email) => {
    try {
      return await generateOTPService(email);
    } catch (error) {
      return { success: false, error: 'Failed to generate OTP' };
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    try {
      return await verifyOTPService(email, otp);
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    try {
      return await resetPasswordService(email, otp, newPassword);
    } catch (error) {
      return { success: false, error: 'Failed to reset password' };
    }
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      return await changePasswordService(user.userId, oldPassword, newPassword);
    } catch (error) {
      return { success: false, error: 'Failed to change password' };
    }
  }, [user]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const result = await updateProfileService(user.userId, updates);
      if (result.success) {
        setUser(prev => ({ ...prev, ...updates }));
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }, [user]);

  const verifyEmail = useCallback(async () => {
    return { success: true };
  }, []);

  const verifyPhoto = useCallback(async (photoUri) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      setUser(prev => ({ ...prev, isPhotoVerified: true }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to verify photo' };
    }
  }, [user]);

  const registerDevice = useCallback(async () => {
    try {
      const result = await registerDeviceService();
      if (result.success) {
        setIsDeviceRegistered(true);
        setDeviceInfo(result.deviceInfo);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to register device' };
    }
  }, []);

  const biometricAuth = useCallback(async () => {
    try {
      return await authenticateWithBiometrics();
    } catch (error) {
      return { success: false, error: 'Biometric authentication failed' };
    }
  }, []);

  const checkBiometricRequired = useCallback(async () => {
    try {
      return await isBiometricRequired();
    } catch {
      return true;
    }
  }, []);

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
