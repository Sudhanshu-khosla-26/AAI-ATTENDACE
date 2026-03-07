/**
 * ProfilePhotoModal - Prompts user to set their profile photo on first login
 * Shown as a modal overlay when user.photoUrl is null/empty
 */

import React, { useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../constants/api';

const STEPS = {
    PROMPT: 'prompt',
    CAMERA: 'camera',
    PREVIEW: 'preview',
    UPLOADING: 'uploading',
    SUCCESS: 'success',
};

export default function ProfilePhotoModal({ visible, onComplete, onSkip }) {
    const [step, setStep] = useState(STEPS.PROMPT);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [error, setError] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const handleOpenCamera = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please allow camera access in your device settings to set your profile photo.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }
        setError('');
        setStep(STEPS.CAMERA);
    };

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.75,
                base64: false,
                skipProcessing: false, // ensure file is fully written to disk
                exif: false,
            });
            // Validate we got a real file URI
            if (!photo?.uri) {
                setError('Camera did not return a photo. Please try again.');
                return;
            }
            setCapturedPhoto(photo);
            setStep(STEPS.PREVIEW);
        } catch (err) {
            console.error('[ProfilePhotoModal] capture error:', err);
            setError('Failed to capture photo: ' + (err.message || 'Unknown error'));
        }
    };

    const handleRetake = () => {
        setCapturedPhoto(null);
        setStep(STEPS.CAMERA);
    };

    const handleUpload = async () => {
        if (!capturedPhoto?.uri) return;
        setStep(STEPS.UPLOADING);
        setError('');

        try {
            const { uploadFile } = await import('../utils/apiClient');
            const result = await uploadFile(
                API_ENDPOINTS.UPLOAD_PROFILE_PHOTO || '/api/upload/profile-photo',
                capturedPhoto.uri,
                'photo'
            );

            if (result.success && result.url) {
                setStep(STEPS.SUCCESS);
                setTimeout(() => onComplete(result.url), 1500);
            } else {
                setError(result.message || result.error || 'Upload failed. Please try again.');
                setStep(STEPS.PREVIEW);
            }
        } catch (err) {
            console.error('[ProfilePhotoModal] upload error:', err);
            setError('Network error: ' + (err.message || 'Check your connection.'));
            setStep(STEPS.PREVIEW);
        }
    };

    const handleSkip = () => {
        setStep(STEPS.PROMPT);
        onSkip();
    };

    const renderPrompt = () => (
        <View style={styles.content}>
            <View style={styles.iconCircle}>
                <Ionicons name="person-circle-outline" size={72} color="#003366" />
            </View>

            <Text style={styles.title}>Set Your Profile Photo</Text>
            <Text style={styles.subtitle}>
                Your profile photo is used to verify your identity during check-in and check-out.
                Please set one now for accurate attendance tracking.
            </Text>

            <View style={styles.tips}>
                {[
                    ['sunny-outline', 'Ensure good lighting'],
                    ['camera-outline', 'Face the camera directly'],
                    ['happy-outline', 'Keep a neutral expression'],
                ].map(([icon, tip]) => (
                    <View key={tip} style={styles.tipRow}>
                        <Ionicons name={icon} size={18} color="#003366" />
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenCamera}>
                <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Take Photo Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for Now</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCamera = () => (
        <View style={styles.cameraContainer}>
            <ExpoCameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
            />
            {/* Oval face guide */}
            <View style={styles.faceGuide} />

            <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(STEPS.PROMPT)}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                    <View style={styles.captureInner} />
                </TouchableOpacity>
                <View style={{ width: 48 }} />
            </View>
        </View>
    );

    const renderPreview = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Review Photo</Text>

            <View style={styles.previewWrapper}>
                <Image source={{ uri: capturedPhoto?.uri }} style={styles.previewImage} />
            </View>

            {!!error && (
                <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Text style={styles.subtitle}>Make sure your face is clearly visible and well-lit.</Text>

            <View style={styles.row}>
                <TouchableOpacity style={styles.outlineBtn} onPress={handleRetake}>
                    <Ionicons name="refresh" size={18} color="#003366" style={{ marginRight: 6 }} />
                    <Text style={styles.outlineBtnText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleUpload}>
                    <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Use Photo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderUploading = () => (
        <View style={[styles.content, styles.center]}>
            <ActivityIndicator size="large" color="#003366" />
            <Text style={styles.uploadingText}>Uploading your photo...</Text>
        </View>
    );

    const renderSuccess = () => (
        <View style={[styles.content, styles.center]}>
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle" size={72} color="#10B981" />
            </View>
            <Text style={styles.title}>Photo Set!</Text>
            <Text style={styles.subtitle}>Your profile photo has been saved successfully.</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Handle bar */}
                <View style={styles.handleBar} />

                {step === STEPS.PROMPT && renderPrompt()}
                {step === STEPS.CAMERA && renderCamera()}
                {step === STEPS.PREVIEW && renderPreview()}
                {step === STEPS.UPLOADING && renderUploading()}
                {step === STEPS.SUCCESS && renderSuccess()}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 16,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    tips: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 28,
        gap: 12,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tipText: {
        fontSize: 14,
        color: '#334155',
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#003366',
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 12,
        flex: 1,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    skipBtn: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    skipText: {
        color: '#94A3B8',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    // Camera
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    faceGuide: {
        position: 'absolute',
        top: '20%',
        alignSelf: 'center',
        width: 220,
        height: 280,
        borderRadius: 110,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.7)',
        borderStyle: 'dashed',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 30,
    },
    cancelBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    captureInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#003366',
    },
    // Preview
    previewWrapper: {
        width: 220,
        height: 220,
        borderRadius: 110,
        overflow: 'hidden',
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#003366',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#003366',
        paddingVertical: 14,
        borderRadius: 14,
        flex: 1,
    },
    outlineBtnText: {
        color: '#003366',
        fontSize: 15,
        fontWeight: '600',
    },
    uploadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
});
