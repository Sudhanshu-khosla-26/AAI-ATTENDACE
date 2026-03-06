/**
 * AAI Attendance App - Photo Verification Screen
 * User photo capture for attendance verification
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';

import Colors from '../constants/colors';
import { useAuth } from '../context';
import CameraView from '../components/CameraView';
import Button from '../components/Button';
import Card from '../components/Card';
import SuccessAnimation from '../components/SuccessAnimation';
import Toast from '../components/Toast';

const STEPS = {
  INTRO: 'intro',
  CAMERA: 'camera',
  PREVIEW: 'preview',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function PhotoVerificationScreen() {
  const router = useRouter();
  const { verifyPhoto } = useAuth();

  const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const handleCapture = (photo) => {
    setCapturedPhoto(photo);
    setCurrentStep(STEPS.PREVIEW);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCurrentStep(STEPS.CAMERA);
  };

  const handleConfirm = async () => {
    setCurrentStep(STEPS.VERIFYING);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save photo locally
    try {
      const fileName = `profile_${Date.now()}.jpg`;
      const localUri = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({
        from: capturedPhoto.uri,
        to: localUri,
      });

      // Verify photo
      const result = await verifyPhoto(localUri);

      if (result.success) {
        setCurrentStep(STEPS.SUCCESS);
      } else {
        setCurrentStep(STEPS.ERROR);
        setToast({
          visible: true,
          message: result.error || 'Photo verification failed',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      setCurrentStep(STEPS.ERROR);
      setToast({
        visible: true,
        message: 'Failed to save photo. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSuccessComplete = () => {
    router.replace('/device-registration');
  };

  const renderIntroStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name="camera" size={64} color={Colors.primary} />
      </View>

      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.description}>
        We need to capture your photo for attendance verification. This photo will be used to verify your identity during check-in and check-out.
      </Text>

      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips for a good photo:</Text>
        <TipItem icon="sunny" text="Ensure good lighting" />
        <TipItem icon="eye" text="Face the camera directly" />
        <TipItem icon="glasses" text="Remove glasses if causing glare" />
        <TipItem icon="happy" text="Keep a neutral expression" />
      </Card>

      <Button
        title="Capture Photo"
        onPress={() => setCurrentStep(STEPS.CAMERA)}
        icon="camera"
        fullWidth
        style={styles.captureButton}
      />
    </View>
  );

  const renderCameraStep = () => (
    <CameraView
      onCapture={handleCapture}
      onCancel={() => setCurrentStep(STEPS.INTRO)}
      showPreview={false}
    />
  );

  const renderPreviewStep = () => (
    <View style={styles.content}>
      <Text style={styles.previewTitle}>Review Your Photo</Text>

      <View style={styles.previewContainer}>
        <Image
          source={{ uri: capturedPhoto?.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.previewText}>
        Make sure your face is clearly visible and well-lit.
      </Text>

      <View style={styles.previewButtons}>
        <Button
          title="Retake"
          onPress={handleRetake}
          variant="outline"
          icon="refresh"
          style={styles.previewButton}
        />
        <Button
          title="Confirm"
          onPress={handleConfirm}
          variant="success"
          icon="checkmark"
          style={styles.previewButton}
        />
      </View>
    </View>
  );

  const renderVerifyingStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.verifyingIcon}>
        <Ionicons name="scan" size={80} color={Colors.primary} />
      </View>
      <Text style={styles.verifyingTitle}>Verifying...</Text>
      <Text style={styles.verifyingText}>
        Please wait while we verify your photo quality
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <SuccessAnimation
      visible={true}
      title="Verification Successful!"
      message="Your photo has been verified and saved. You can now proceed to device registration."
      onComplete={handleSuccessComplete}
    />
  );

  const renderErrorStep = () => (
    <View style={styles.content}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.error + '15' }]}>
        <Ionicons name="close-circle" size={64} color={Colors.error} />
      </View>

      <Text style={styles.title}>Verification Failed</Text>
      <Text style={styles.description}>
        We couldn't verify your photo. Please ensure good lighting and try again.
      </Text>

      <Button
        title="Try Again"
        onPress={() => setCurrentStep(STEPS.CAMERA)}
        variant="primary"
        icon="refresh"
        fullWidth
        style={styles.captureButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      {currentStep === STEPS.INTRO && renderIntroStep()}
      {currentStep === STEPS.CAMERA && renderCameraStep()}
      {currentStep === STEPS.PREVIEW && renderPreviewStep()}
      {currentStep === STEPS.VERIFYING && renderVerifyingStep()}
      {currentStep === STEPS.SUCCESS && renderSuccessStep()}
      {currentStep === STEPS.ERROR && renderErrorStep()}

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

const TipItem = ({ icon, text }) => (
  <View style={styles.tipItem}>
    <Ionicons name={icon} size={20} color={Colors.primary} />
    <Text style={styles.tipText}>{text}</Text>
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
  tipsCard: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  captureButton: {
    marginTop: 'auto',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  previewContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  verifyingIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  verifyingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
