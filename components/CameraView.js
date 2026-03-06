/**
 * AAI Attendance App - Camera View Component
 * Face capture for attendance verification - Fixed Permission Flow
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Button from './Button';

const CameraView = ({
  onCapture,
  onCancel,
  showPreview = true,
  style = {},
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);

  // Auto-request permission when component mounts (if canAskAgain)
  useEffect(() => {
    if (permission !== null && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // ── Step 1: Still determining permission status ──────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, styles.permissionContainer, style]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.permissionText}>Checking camera permissions…</Text>
      </View>
    );
  }

  // ── Step 2: Not yet granted but CAN ask → show request button ────────────
  if (!permission.granted && permission.canAskAgain) {
    return (
      <View style={[styles.container, styles.permissionContainer, style]}>
        <Ionicons name="camera" size={56} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture your photo for attendance verification.
        </Text>
        <Button
          title="Grant Camera Access"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={[styles.permissionButton, { marginTop: 12 }]}
        />
      </View>
    );
  }

  // ── Step 3: Permanently denied → guide to device Settings ────────────────
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer, style]}>
        <Ionicons name="camera-off" size={56} color={Colors.error} />
        <Text style={styles.permissionTitle}>Camera Access Denied</Text>
        <Text style={styles.permissionText}>
          Camera permission was denied. Please enable it manually:{'\n\n'}
          <Text style={styles.settingsHint}>
            Settings → Apps → AAI Attendance → Permissions → Camera → Allow
          </Text>
        </Text>
        <Button
          title="Open Settings"
          onPress={() => Linking.openSettings()}
          style={styles.permissionButton}
        />
        <Button
          title="Go Back"
          onPress={onCancel}
          variant="outline"
          style={[styles.permissionButton, { marginTop: 12 }]}
        />
      </View>
    );
  }

  // ── Camera helpers ────────────────────────────────────────────────────────

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });
        setCapturedPhoto(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const retakePicture = () => setCapturedPhoto(null);

  const confirmPicture = () => {
    if (capturedPhoto) onCapture?.(capturedPhoto);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // ── Preview after capture ─────────────────────────────────────────────────
  if (capturedPhoto && showPreview) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri: capturedPhoto.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={styles.previewOverlay}>
          <View style={styles.previewActions}>
            <Button
              title="Retake"
              onPress={retakePicture}
              variant="outline"
              icon="refresh"
              style={styles.previewButton}
            />
            <Button
              title="Confirm"
              onPress={confirmPicture}
              variant="success"
              icon="checkmark"
              style={styles.previewButton}
            />
          </View>
        </View>
      </View>
    );
  }

  // ── Live Camera ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, style]}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableZoomGesture
      >
        {/* Face Guide Overlay */}
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <View style={styles.faceGuide}>
              <View style={styles.faceGuideInner} />
            </View>
            <Text style={styles.guideText}>
              Position your face within the oval
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
            <Ionicons name="close" size={28} color={Colors.textWhite} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  settingsHint: {
    fontWeight: '600',
    color: Colors.text,
    fontSize: 13,
  },
  permissionButton: {
    minWidth: 200,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    alignItems: 'center',
  },
  faceGuide: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: Colors.textWhite,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuideInner: {
    width: 220,
    height: 300,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: Colors.textWhite + '60',
    borderStyle: 'dashed',
  },
  guideText: {
    color: Colors.textWhite,
    fontSize: 14,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.textWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.textWhite + '60',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.textWhite,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  previewImage: {
    flex: 1,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CameraView;
