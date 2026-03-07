/**
 * AAI Attendance App - Root Layout
 * Main app layout with providers
 */

import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, AttendanceProvider, LeaveProvider, AppProvider, useAuth } from '../context';
import ErrorBoundary from '../components/ErrorBoundary';
import ProfilePhotoModal from '../components/ProfilePhotoModal';
import Colors from '../constants/colors';

// Theme configuration for React Native Paper
const theme = {
  colors: {
    primary: Colors.primary,
    accent: Colors.saffron,
    background: Colors.background,
    surface: Colors.background,
    text: Colors.text,
    error: Colors.error,
    success: Colors.success,
  },
};

/**
 * Inner layout component that has access to AuthContext.
 * Shows the ProfilePhotoModal when user is logged in but has no profile photo.
 */
function InnerLayout() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    // Show photo setup modal if user is authenticated but has no profile photo
    if (isAuthenticated && user && !user.photoUrl) {
      // Small delay so the main tab screen loads first
      const timer = setTimeout(() => setShowPhotoModal(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowPhotoModal(false);
    }
  }, [isAuthenticated, user?.photoUrl]);

  const handlePhotoComplete = (photoUrl) => {
    // Update local user state with new photo URL
    updateProfile({ photoUrl });
    setShowPhotoModal(false);
  };

  const handlePhotoSkip = () => {
    setShowPhotoModal(false);
    // Will reappear on next login since photoUrl is still null
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="photo-verification" />
        <Stack.Screen name="device-registration" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mark-attendance" />
        <Stack.Screen name="apply-leave" />
        <Stack.Screen name="location-management" />
      </Stack>

      {/* Profile Photo Setup Modal — shown after first login if no photo set */}
      <ProfilePhotoModal
        visible={showPhotoModal}
        onComplete={handlePhotoComplete}
        onSkip={handlePhotoSkip}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <AttendanceProvider>
              <LeaveProvider>
                <AppProvider>
                  <InnerLayout />
                </AppProvider>
              </LeaveProvider>
            </AttendanceProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
