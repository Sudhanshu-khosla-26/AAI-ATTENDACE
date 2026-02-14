/**
 * AAI Attendance App - Device Registration Screen
 * One-time device registration after first login
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import Colors from '../constants/colors';
import { useAuth } from '../context';
import Button from '../components/Button';
import Card from '../components/Card';
import SuccessAnimation from '../components/SuccessAnimation';
import Toast from '../components/Toast';

const STEPS = {
  INFO: 'info',
  BIOMETRIC: 'biometric',
  SUCCESS: 'success',
};

export default function DeviceRegistrationScreen() {
  const router = useRouter();
  const { registerDevice, biometricAuth } = useAuth();

  const [currentStep, setCurrentStep] = useState(STEPS.INFO);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const deviceInfo = {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    uniqueId: Constants.installationId || 'Unknown',
  };

  const handleRegister = async () => {
    setCurrentStep(STEPS.BIOMETRIC);
    
    // Trigger biometric authentication
    const bioResult = await biometricAuth();
    
    if (bioResult.success) {
      setLoading(true);
      const result = await registerDevice();
      setLoading(false);
      
      if (result.success) {
        setCurrentStep(STEPS.SUCCESS);
      } else {
        setToast({
          visible: true,
          message: result.error || 'Device registration failed',
          type: 'error',
        });
        setCurrentStep(STEPS.INFO);
      }
    } else {
      setToast({
        visible: true,
        message: bioResult.error || 'Biometric authentication failed',
        type: 'error',
      });
      setCurrentStep(STEPS.INFO);
    }
  };

  const handleSuccessComplete = () => {
    router.replace('/(tabs)');
  };

  const renderInfoStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="phone-portrait" size={64} color={Colors.primary} />
      </View>

      <Text style={styles.title}>Register Your Device</Text>
      <Text style={styles.description}>
        This app will be linked to this device for security. Please verify your device information below.
      </Text>

      <Card style={styles.deviceCard}>
        <DeviceInfoItem label="Device" value={deviceInfo.modelName || 'Unknown'} />
        <DeviceInfoItem label="Brand" value={deviceInfo.brand || 'Unknown'} />
        <DeviceInfoItem label="Operating System" value={`${deviceInfo.osName} ${deviceInfo.osVersion}`} />
        <DeviceInfoItem label="Device ID" value={deviceInfo.uniqueId.substring(0, 16) + '...'} />
      </Card>

      <Text style={styles.note}>
        You will need to authenticate using your biometric (fingerprint/Face ID) to complete registration.
      </Text>

      <Button
        title="Register Device"
        onPress={handleRegister}
        loading={loading}
        icon="finger-print"
        fullWidth
        style={styles.registerButton}
      />
    </View>
  );

  const renderBiometricStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.biometricIconContainer}>
        <Ionicons name="finger-print" size={80} color={Colors.primary} />
      </View>
      <Text style={styles.biometricTitle}>Authenticate</Text>
      <Text style={styles.biometricText}>
        Please use your biometric to verify device ownership
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <SuccessAnimation
      visible={true}
      title="Device Registered!"
      message="Your device has been successfully registered. You can now use the app."
      onComplete={handleSuccessComplete}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      {currentStep === STEPS.INFO && renderInfoStep()}
      {currentStep === STEPS.BIOMETRIC && renderBiometricStep()}
      {currentStep === STEPS.SUCCESS && renderSuccessStep()}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const DeviceInfoItem = ({ label, value }) => (
  <View style={styles.deviceInfoItem}>
    <Text style={styles.deviceInfoLabel}>{label}</Text>
    <Text style={styles.deviceInfoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deviceCard: {
    marginBottom: 24,
  },
  deviceInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  deviceInfoLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  deviceInfoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  registerButton: {
    marginTop: 'auto',
  },
  biometricIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  biometricTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  biometricText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
