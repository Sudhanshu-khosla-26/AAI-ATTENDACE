/**
 * AAI Attendance App - Root Layout
 * Main app layout with providers
 */

import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, AttendanceProvider, LeaveProvider, AppProvider } from '../context';
import ErrorBoundary from '../components/ErrorBoundary';
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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <AttendanceProvider>
              <LeaveProvider>
                <AppProvider>
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
                    <Stack.Screen name="biometric-unlock" />
                    <Stack.Screen name="device-registration" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="mark-attendance" />
                    <Stack.Screen name="apply-leave" />
                    <Stack.Screen name="location-management" />
                  </Stack>
                </AppProvider>
              </LeaveProvider>
            </AttendanceProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
