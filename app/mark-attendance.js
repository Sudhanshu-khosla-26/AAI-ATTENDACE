/**
 * AAI Attendance App - Mark Attendance Screen
 * Check-in and check-out with GPS verification + face photo capture
 * Photos are saved locally AND uploaded to backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { getLocationById, checkPointInGeofence, formatDistance } from '../services/locationService';
import { formatTime } from '../utils/dateUtils';

// Import optional components with fallback
let CameraViewComponent = null;
try { CameraViewComponent = require('../components/CameraView').default; } catch { }

const STEPS = {
  LOCATION: 'location',
  CAMERA: 'camera',
  PROCESSING: 'processing',
  SUCCESS: 'success',
};

const COLORS = {
  primary: '#1C4CA6',
  primaryLight: '#2563EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { user } = useAuth();
  const { getCurrentLocation, markCheckIn, markCheckOut } = useAttendance();

  const isCheckIn = type !== 'checkout';

  const [currentStep, setCurrentStep] = useState(STEPS.LOCATION);
  const [userLocation, setUserLocation] = useState(null);
  const [workplace, setWorkplace] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [distanceToWorkplace, setDistanceToWorkplace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = useCallback(async () => {
    setLoading(true);
    setLocationError(null);

    try {
      // 1. Get user's assigned workplace from backend
      const locationId = user?.location || user?.locationId;
      let workplaceData = null;

      if (locationId) {
        workplaceData = await getLocationById(
          typeof locationId === 'object' ? locationId._id || locationId.id : locationId
        );
        setWorkplace(workplaceData);
      }

      // 2. Get user's current GPS position
      const locationResult = await getCurrentLocation();
      if (!locationResult.success) {
        setLocationError(locationResult.error || 'Could not get your location. Please enable GPS.');
        setLoading(false);
        return;
      }

      setUserLocation(locationResult.location);

      // 3. Point-based geofence check (local calculation)
      if (workplaceData) {
        const geo = checkPointInGeofence(locationResult.location, workplaceData);
        setIsInsideGeofence(geo.isInside);
        setDistanceToWorkplace(geo.distance);
      } else {
        // No workplace assigned - be permissive (admin hasn't assigned location)
        setIsInsideGeofence(true);
        setDistanceToWorkplace(0);
      }
    } catch (error) {
      console.error('[mark-attendance] initializeLocation error:', error);
      setLocationError('Unexpected error getting your location. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [user, getCurrentLocation]);

  const handleProceedToCamera = () => {
    if (!isInsideGeofence && workplace) {
      Alert.alert(
        '📍 Outside Workplace',
        `You are ${formatDistance(distanceToWorkplace)} from ${workplace.name}.\n\nYou must be within ${workplace.radius || 200}m to mark attendance.`,
        [
          { text: 'Retry Location', onPress: initializeLocation },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    setCurrentStep(STEPS.CAMERA);
  };

  const handleCapture = async (photo) => {
    setCurrentStep(STEPS.PROCESSING);
    startProgressAnimation();

    const locationId = user?.location || user?.locationId;
    const locationIdStr = typeof locationId === 'object'
      ? (locationId._id || locationId.id)
      : locationId;

    try {
      const result = isCheckIn
        ? await markCheckIn(userLocation, photo?.uri || null, locationIdStr)
        : await markCheckOut(userLocation, photo?.uri || null, locationIdStr);

      if (result.success) {
        setSuccessData({
          time: formatTime(new Date()),
          workplace: workplace?.name || 'Workplace',
          type: isCheckIn ? 'Check-In' : 'Check-Out',
        });
        setCurrentStep(STEPS.SUCCESS);
      } else {
        Alert.alert(
          'Attendance Failed',
          result.error || 'Could not process your attendance. Please try again.',
          [{ text: 'Retry', onPress: () => setCurrentStep(STEPS.LOCATION) }]
        );
      }
    } catch (error) {
      console.error('[mark-attendance] handleCapture error:', error);
      Alert.alert('Error', 'An unexpected error occurred.', [
        { text: 'OK', onPress: () => setCurrentStep(STEPS.LOCATION) },
      ]);
    }
  };

  // Skip photo if camera not available
  const handleSkipPhoto = () => handleCapture(null);

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  // ─── Render: Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
          <Text style={styles.loadingSubText}>Please ensure GPS is enabled</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Location Step ─────────────────────────────────────────────────
  if (currentStep === STEPS.LOCATION) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LinearGradient
          colors={[isCheckIn ? '#1C4CA6' : '#7C3AED', isCheckIn ? '#2563EB' : '#9333EA']}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isCheckIn ? '🟢 Check In' : '🔴 Check Out'}</Text>
          <Text style={styles.headerSubtitle}>
            {isCheckIn ? 'Start your work day' : 'End your work day'}
          </Text>
        </LinearGradient>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {locationError ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="location-off" size={48} color={COLORS.error} />
              </View>
              <Text style={styles.errorTitle}>Location Unavailable</Text>
              <Text style={styles.errorMessage}>{locationError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={initializeLocation}>
                <Ionicons name="refresh" size={18} color="#FFF" />
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Location Status Card */}
              <View style={[styles.statusCard, isInsideGeofence ? styles.successCard : styles.errorCard2]}>
                <View style={styles.statusIconRow}>
                  <View style={[styles.statusIcon, { backgroundColor: isInsideGeofence ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Ionicons
                      name={isInsideGeofence ? 'checkmark-circle' : 'warning'}
                      size={32}
                      color={isInsideGeofence ? COLORS.success : COLORS.error}
                    />
                  </View>
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusLabel}>
                      {isInsideGeofence ? '✓ Within Workplace Area' : '⚠ Outside Workplace Area'}
                    </Text>
                    <Text style={styles.statusWorkplace}>
                      {workplace?.name || 'No workplace assigned'}
                    </Text>
                  </View>
                </View>

                {distanceToWorkplace !== null && (
                  <View style={styles.distanceRow}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.distanceText}>
                      Distance: {formatDistance(distanceToWorkplace)}
                      {workplace?.radius ? `  (Allowed: ${workplace.radius}m)` : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Current Location Info */}
              {userLocation && (
                <View style={styles.coordsCard}>
                  <Text style={styles.coordsLabel}>
                    <Ionicons name="locate" size={14} color={COLORS.primary} /> Your location
                  </Text>
                  <Text style={styles.coordsText}>
                    {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                  </Text>
                  {userLocation.accuracy && (
                    <Text style={styles.coordsAccuracy}>
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </Text>
                  )}
                </View>
              )}

              {/* Time display */}
              <View style={styles.timeCard}>
                <Text style={styles.timeLabel}>Current Time</Text>
                <Text style={styles.timeDisplay}>{formatTime(new Date())}</Text>
              </View>

              {/* Action buttons */}
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: isCheckIn ? COLORS.primary : '#7C3AED' }]}
                onPress={handleProceedToCamera}
                activeOpacity={0.85}
              >
                <Ionicons name="camera" size={22} color="#FFF" />
                <Text style={styles.mainBtnText}>
                  {isCheckIn ? 'Proceed to Check-In' : 'Proceed to Check-Out'}
                </Text>
              </TouchableOpacity>

              {!isInsideGeofence && workplace && (
                <Text style={styles.warningHint}>
                  You must be within {workplace.radius || 200}m of {workplace.name} to mark attendance.
                </Text>
              )}

              <TouchableOpacity style={styles.refreshBtn} onPress={initializeLocation}>
                <Ionicons name="refresh" size={16} color={COLORS.primary} />
                <Text style={styles.refreshText}>Refresh Location</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Render: Camera Step ───────────────────────────────────────────────────
  if (currentStep === STEPS.CAMERA) {
    if (CameraViewComponent) {
      return (
        <SafeAreaView style={styles.container} edges={[]}>
          <StatusBar style="light" />
          <CameraViewComponent
            onCapture={handleCapture}
            onCancel={() => setCurrentStep(STEPS.LOCATION)}
            instruction={isCheckIn ? 'Take a selfie for check-in' : 'Take a selfie for check-out'}
          />
        </SafeAreaView>
      );
    }
    // Fallback if camera component not available
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LinearGradient colors={['#1C4CA6', '#2563EB']} style={styles.headerGradient}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentStep(STEPS.LOCATION)}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📸 Photo Capture</Text>
          <Text style={styles.headerSubtitle}>Camera not available on this device</Text>
        </LinearGradient>
        <View style={styles.noCameraContainer}>
          <Ionicons name="camera-outline" size={80} color={COLORS.border} />
          <Text style={styles.noCameraTitle}>Camera unavailable</Text>
          <Text style={styles.noCameraText}>
            Continue marking attendance without a photo.
          </Text>
          <TouchableOpacity style={[styles.mainBtn, { marginTop: 24 }]} onPress={handleSkipPhoto}>
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.mainBtnText}>Continue Without Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => setCurrentStep(STEPS.LOCATION)}>
            <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
            <Text style={styles.refreshText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Processing ────────────────────────────────────────────────────
  if (currentStep === STEPS.PROCESSING) {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.processingTitle}>Processing...</Text>
          <Text style={styles.processingSubText}>
            Submitting your {isCheckIn ? 'check-in' : 'check-out'}
          </Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: isCheckIn ? COLORS.primary : '#7C3AED' }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: Success ───────────────────────────────────────────────────────
  if (currentStep === STEPS.SUCCESS) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.success, '#059669']}
          style={styles.successFullscreen}
        >
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={72} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>
            {isCheckIn ? 'Checked In! 🎉' : 'Checked Out! 👋'}
          </Text>
          <Text style={styles.successSubtitle}>{successData?.time || ''}</Text>
          {successData?.workplace && (
            <View style={styles.successLocation}>
              <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.successLocationText}>{successData.workplace}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.successBtnText}>Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.success} />
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ─── Loading ─────────────────────────────────────────────────────
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  loadingSubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },

  // ─── Header ──────────────────────────────────────────────────────
  headerGradient: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },

  // ─── Status Cards ─────────────────────────────────────────────────
  statusCard: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1 },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  errorCard2: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECACA',
  },
  statusIconRow: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  statusInfo: { flex: 1, marginLeft: 14 },
  statusLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  statusWorkplace: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  distanceText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 6 },

  // ─── Coords Card ──────────────────────────────────────────────────
  coordsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordsLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 6 },
  coordsText: { fontSize: 14, color: COLORS.text, fontFamily: 'monospace' },
  coordsAccuracy: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },

  // ─── Time Card ────────────────────────────────────────────────────
  timeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  timeLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  timeDisplay: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginTop: 4 },

  // ─── Buttons ──────────────────────────────────────────────────────
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  warningHint: { fontSize: 12, color: COLORS.warning, textAlign: 'center', marginBottom: 12 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 },
  refreshText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  retryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  // ─── Error ────────────────────────────────────────────────────────
  errorContainer: { alignItems: 'center', paddingVertical: 48 },
  errorIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  errorTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  errorMessage: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  // ─── Processing ────────────────────────────────────────────────────
  processingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  processingTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  processingSubText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 10, textAlign: 'center' },
  progressBar: { width: '80%', height: 6, backgroundColor: COLORS.border, borderRadius: 4, marginTop: 32, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 4 },

  // ─── No Camera ────────────────────────────────────────────────────
  noCameraContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noCameraTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  noCameraText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },

  // ─── Success ──────────────────────────────────────────────────────
  successFullscreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIconCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  successTitle: { fontSize: 36, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  successSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 12 },
  successLocation: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  successLocationText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  successBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: 14, marginTop: 48,
  },
  successBtnText: { color: COLORS.success, fontSize: 17, fontWeight: '700' },
});
