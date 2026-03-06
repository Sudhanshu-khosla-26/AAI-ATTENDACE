/**
 * AAI Attendance App - Mark Attendance Screen
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
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
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { getLocationById, checkPointInGeofence, formatDistance } from '../services/locationService';
import { formatTime, formatDate } from '../utils/dateUtils';
import Colors from '../constants/colors';

import CameraView from '../components/CameraView';

const { width, height } = Dimensions.get('window');

const STEPS = {
  LOCATION: 'location',
  CAMERA: 'camera',
  PROCESSING: 'processing',
  SUCCESS: 'success',
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
      const locationId = user?.location || user?.locationId;
      let workplaceData = null;

      if (locationId) {
        workplaceData = await getLocationById(
          typeof locationId === 'object' ? locationId._id || locationId.id : locationId
        );
        setWorkplace(workplaceData);
      }

      const locationResult = await getCurrentLocation();
      if (!locationResult.success) {
        setLocationError(locationResult.error || 'Could not get your location. Please enable GPS.');
        setLoading(false);
        return;
      }

      setUserLocation(locationResult.location);

      if (workplaceData) {
        const geo = checkPointInGeofence(locationResult.location, workplaceData);
        setIsInsideGeofence(geo.isInside);
        setDistanceToWorkplace(geo.distance);
      } else {
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
      <View style={styles.loadingRoot}>
        <StatusBar style="light" />
        <LinearGradient colors={['#003366', '#0055AA']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Syncing GPS...</Text>
          <Text style={styles.loadingSubText}>Verifying your workstation location</Text>
        </LinearGradient>
      </View>
    );
  }

  // ─── Render: Success ───────────────────────────────────────────────────────
  if (currentStep === STEPS.SUCCESS) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <LinearGradient colors={['#10B981', '#059669']} style={styles.successFullscreen}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={60} color="#FFF" />
            </View>
          </View>
          <Text style={styles.successTitle}>{isCheckIn ? 'Duty Started' : 'Duty Ended'}</Text>
          <Text style={styles.successSubtitle}>{successData?.time}</Text>

          <View style={styles.successCard}>
            <View style={styles.successLine}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.successLocationText}>{successData?.workplace}</Text>
            </View>
            <View style={styles.successLine}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.successLocationText}>Biometric Verified</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.successBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ─── Render: Camera ────────────────────────────────────────────────────────
  if (currentStep === STEPS.CAMERA) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <CameraView
          onCapture={handleCapture}
          onCancel={() => setCurrentStep(STEPS.LOCATION)}
          showPreview={true}
        />
      </View>
    );
  }

  // ─── Render: Processing ────────────────────────────────────────────────────
  if (currentStep === STEPS.PROCESSING) {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.processingRoot}>
          <View style={styles.procIconBox}>
            <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.processingTitle}>Encrypting Data...</Text>
          <Text style={styles.processingSubText}>
            Securely uploading your {isCheckIn ? 'check-in' : 'check-out'} record
          </Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: Colors.primary }]} />
          </View>
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  // ─── Render: Location Step ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isCheckIn ? 'Duty Check-In' : 'Duty Check-Out'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Date/Time Banner */}
        <View style={styles.timeBanner}>
          <Text style={styles.bannerDay}>{new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</Text>
          <Text style={styles.bannerTime}>{formatTime(new Date())}</Text>
          <Text style={styles.bannerDate}>{formatDate(new Date(), 'dd MMMM yyyy')}</Text>
        </View>

        {locationError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>GPS Connection Lost</Text>
            <Text style={styles.errorMsg}>{locationError}</Text>
            <TouchableOpacity style={styles.retryAction} onPress={initializeLocation}>
              <Text style={styles.retryText}>Reconnect GPS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.labelText}>WORKPLACE VERIFICATION</Text>
            </View>

            {/* Geofence Status */}
            <View style={[styles.geoCard, isInsideGeofence ? styles.geoCardOk : styles.geoCardError]}>
              <View style={[styles.geoIcon, { backgroundColor: isInsideGeofence ? '#10B98120' : '#EF444420' }]}>
                <Ionicons
                  name={isInsideGeofence ? "navigate" : "warning"}
                  size={24}
                  color={isInsideGeofence ? "#10B981" : "#EF4444"}
                />
              </View>
              <View style={styles.geoInfo}>
                <Text style={styles.workplaceName}>{workplace?.name || 'Assigning workplace...'}</Text>
                <Text style={[styles.geoStatusText, { color: isInsideGeofence ? "#10B981" : "#EF4444" }]}>
                  {isInsideGeofence ? 'You are within the airport zone' : `You are ${formatDistance(distanceToWorkplace)} away`}
                </Text>
              </View>
              {isInsideGeofence && (
                <View style={styles.checkMark}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>

            {/* Coordinates Card */}
            <View style={styles.detailsCard}>
              <DetailRow icon="locate-outline" label="Coordinates" value={`${userLocation?.latitude.toFixed(5)}, ${userLocation?.longitude.toFixed(5)}`} />
              <DetailRow icon="shield-outline" label="GPS Precision" value={`±${Math.round(userLocation?.accuracy || 0)} meters`} isLast />
            </View>

            {/* Instructions */}
            <View style={styles.instrBox}>
              <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
              <Text style={styles.instrText}>
                The system will now prompt for a photo verification to confirm your identity at the workplace.
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[styles.primaryBtn, !isInsideGeofence && workplace && { opacity: 0.6 }]}
                onPress={handleProceedToCamera}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isCheckIn ? ['#003366', '#0055AA'] : ['#EF4444', '#B91C1C']}
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="camera" size={20} color="#FFF" />
                  <Text style={styles.btnText}>{isCheckIn ? 'Open Camera' : 'Confirm Exit'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.ghostBtn} onPress={initializeLocation}>
                  <Ionicons name="refresh" size={14} color={Colors.primary} />
                  <Text style={styles.ghostText}>Re-verify Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => {
                    Alert.alert(
                      'Skip Photo Verification?',
                      'While photo verification is recommended, you can proceed without it if your camera is not working.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Proceed without Photo', onPress: () => handleCapture(null) }
                      ]
                    );
                  }}
                >
                  <Ionicons name="eye-off-outline" size={14} color="#64748B" />
                  <Text style={[styles.ghostText, { color: '#64748B' }]}>Skip Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value, isLast }) => (
  <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
    <Ionicons name={icon} size={16} color="#94A3B8" />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailVal}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F6FA' },
  // Header
  navHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
  },
  navBack: { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  scrollContent: { paddingBottom: 40 },

  // Time Banner
  timeBanner: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bannerDay: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  bannerTime: { fontSize: 42, fontWeight: '800', color: '#FFF', marginVertical: 4 },
  bannerDate: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  sectionLabel: { marginHorizontal: 18, marginTop: 24, marginBottom: 10 },
  labelText: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },

  // Geo Card
  geoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  geoCardOk: { borderColor: 'rgba(16,185,129,0.3)' },
  geoCardError: { borderColor: 'rgba(239,68,68,0.3)' },
  geoIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  geoInfo: { flex: 1, marginLeft: 16 },
  workplaceName: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  geoStatusText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  checkMark: { marginLeft: 8 },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailContent: { marginLeft: 14 },
  detailLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  detailVal: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 1 },

  instrBox: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 20, opacity: 0.7 },
  instrText: { flex: 1, fontSize: 11, color: '#475569', lineHeight: 16, fontWeight: '500' },

  // Footer Actions
  footerActions: { marginTop: 32, paddingHorizontal: 14, paddingBottom: 20 },
  primaryBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4 },
  ghostText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // States
  loadingRoot: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 20 },
  loadingSubText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center' },

  processingRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  procIconBox: { width: 80, height: 80, borderRadius: 25, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  processingTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  processingSubText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginTop: 30, overflow: 'hidden' },
  progressFill: { height: '100%' },

  successFullscreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIconOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successIconInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  successSubtitle: { fontSize: 20, color: 'rgba(255,255,255,0.8)', marginTop: 8, fontWeight: '700' },
  successCard: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', padding: 20, marginTop: 40 },
  successLine: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  successLocationText: { fontSize: 15, fontWeight: '700', color: '#334155' },
  successBtn: { backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 40 },
  successBtnText: { color: '#10B981', fontSize: 17, fontWeight: '800' },

  errorBox: { alignItems: 'center', padding: 40, marginTop: 40 },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginTop: 16 },
  errorMsg: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryAction: { backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 24 },
  retryText: { color: '#FFF', fontWeight: '700' },
});
