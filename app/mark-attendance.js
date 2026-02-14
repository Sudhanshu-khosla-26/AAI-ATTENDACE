/**
 * AAI Attendance App - Mark Attendance Screen
 * Check-in and check-out with location and face capture
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

import Colors from '../constants/colors';
import { useAuth, useAttendance } from '../context';
import Header from '../components/Header';
import Button from '../components/Button';
import GeofenceMap from '../components/GeofenceMap';
import CameraView from '../components/CameraView';
import SuccessAnimation from '../components/SuccessAnimation';
import Loading from '../components/Loading';
import Card from '../components/Card';
import { formatTime } from '../utils/dateUtils';
import { formatDistance } from '../utils/locationUtils';
import { getLocationById } from '../services/locationService';

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
  const { getCurrentLocation, checkGeofence, markCheckIn, markCheckOut } = useAttendance();

  const [currentStep, setCurrentStep] = useState(STEPS.LOCATION);
  const [userLocation, setUserLocation] = useState(null);
  const [workplace, setWorkplace] = useState(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [distance, setDistance] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const isCheckIn = type === 'checkin';

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setLoading(true);
    
    // Get user's assigned workplace
    const location = await getLocationById(user?.location);
    setWorkplace(location);

    // Get current location
    const locationResult = await getCurrentLocation();
    
    if (!locationResult.success) {
      setLocationError(locationResult.error);
      setLoading(false);
      return;
    }

    setUserLocation(locationResult.location);

    // Check geofence
    const geofenceResult = await checkGeofence(locationResult.location);
    if (geofenceResult.success) {
      setIsInsideGeofence(geofenceResult.isInside);
      setDistance(geofenceResult.distance);
    }

    setLoading(false);
  };

  const handleProceedToCamera = () => {
    if (!isInsideGeofence) {
      Alert.alert(
        'Outside Geofence',
        'You must be within the workplace area to mark attendance.',
        [{ text: 'OK' }]
      );
      return;
    }
    setCurrentStep(STEPS.CAMERA);
  };

  const handleCapture = async (photo) => {
    setCapturedPhoto(photo);
    setCurrentStep(STEPS.PROCESSING);

    // Save photo to local storage
    const fileName = `attendance_${Date.now()}.jpg`;
    const localUri = FileSystem.documentDirectory + fileName;
    
    try {
      await FileSystem.copyAsync({
        from: photo.uri,
        to: localUri,
      });

      // Mark attendance
      const result = isCheckIn
        ? await markCheckIn(userLocation, localUri)
        : await markCheckOut(userLocation, localUri);

      if (result.success) {
        setCurrentStep(STEPS.SUCCESS);
      } else {
        Alert.alert('Error', result.error, [
          { text: 'OK', onPress: () => setCurrentStep(STEPS.LOCATION) },
        ]);
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.', [
        { text: 'OK', onPress: () => setCurrentStep(STEPS.CAMERA) },
      ]);
    }
  };

  const handleSuccessComplete = () => {
    router.replace('/(tabs)');
  };

  const renderLocationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {isCheckIn ? 'Mark Check-In' : 'Mark Check-Out'}
      </Text>
      <Text style={styles.stepDescription}>
        Verify your location before marking attendance
      </Text>

      {locationError ? (
        <Card style={styles.errorCard}>
          <Ionicons name="location-off" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorMessage}>{locationError}</Text>
          <Button
            title="Retry"
            onPress={initializeLocation}
            variant="outline"
            style={styles.retryButton}
          />
        </Card>
      ) : (
        <>
          <GeofenceMap
            userLocation={userLocation}
            workplace={workplace}
            isInsideGeofence={isInsideGeofence}
            distance={distance}
            style={styles.map}
          />

          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons
                name={isInsideGeofence ? 'checkmark-circle' : 'close-circle'}
                size={28}
                color={isInsideGeofence ? Colors.success : Colors.error}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {isInsideGeofence ? 'Inside Workplace' : 'Outside Workplace'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  Distance: {formatDistance(distance)}
                </Text>
              </View>
            </View>
          </Card>

          <Button
            title={isCheckIn ? 'Capture Check-In Photo' : 'Capture Check-Out Photo'}
            onPress={handleProceedToCamera}
            variant={isInsideGeofence ? 'success' : 'secondary'}
            icon="camera"
            disabled={!isInsideGeofence}
            fullWidth
            style={styles.proceedButton}
          />

          {!isInsideGeofence && (
            <Text style={styles.warningText}>
              You must be within {workplace?.radius || 200} meters of your workplace to mark attendance
            </Text>
          )}
        </>
      )}
    </View>
  );

  const renderCameraStep = () => (
    <View style={styles.stepContainer}>
      <CameraView
        onCapture={handleCapture}
        onCancel={() => setCurrentStep(STEPS.LOCATION)}
      />
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.processingContainer}>
      <Loading visible={true} message={`Processing ${isCheckIn ? 'Check-In' : 'Check-Out'}...`} />
    </View>
  );

  const renderSuccessStep = () => (
    <SuccessAnimation
      visible={true}
      title={isCheckIn ? 'Check-In Successful!' : 'Check-Out Successful!'}
      message={`You have successfully marked your ${isCheckIn ? 'check-in' : 'check-out'} at ${formatTime(new Date())}`}
      onComplete={handleSuccessComplete}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      {currentStep !== STEPS.CAMERA && currentStep !== STEPS.SUCCESS && (
        <Header
          title={isCheckIn ? 'Check-In' : 'Check-Out'}
          showBack
          onBackPress={() => router.back()}
        />
      )}

      {currentStep === STEPS.LOCATION && renderLocationStep()}
      {currentStep === STEPS.CAMERA && renderCameraStep()}
      {currentStep === STEPS.PROCESSING && renderProcessingStep()}
      {currentStep === STEPS.SUCCESS && renderSuccessStep()}

      <Loading visible={loading} overlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepContainer: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  map: {
    height: 300,
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proceedButton: {
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    minWidth: 120,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
