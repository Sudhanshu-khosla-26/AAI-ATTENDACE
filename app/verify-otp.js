/**
 * AAI Attendance App - Verify OTP Screen
 * Email OTP verification for first-time login
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { useAuth } from '../context';
import Button from '../components/Button';
import Header from '../components/Header';
import Toast from '../components/Toast';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { user, generateOTP, verifyOTP, verifyEmail } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [demoOtp, setDemoOtp] = useState('');
  
  const inputRefs = useRef([]);

  // Generate OTP on mount
  useEffect(() => {
    handleSendOTP();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOTP = async () => {
    if (!user?.email) return;
    
    const result = await generateOTP(user.email);
    if (result.success) {
      setDemoOtp(result.demoOtp);
      setTimer(30);
      setToast({
        visible: true,
        message: 'OTP sent to your email',
        type: 'success',
      });
    } else {
      setToast({
        visible: true,
        message: result.error || 'Failed to send OTP',
        type: 'error',
      });
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== OTP_LENGTH) {
      setErrors({ otp: 'Please enter complete OTP' });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(otpString);
    
    if (result.success) {
      // Mark email as verified
      await verifyEmail();
      
      setToast({
        visible: true,
        message: 'Email verified successfully',
        type: 'success',
      });
      
      // Navigate to photo verification
      setTimeout(() => {
        router.replace('/photo-verification');
      }, 1000);
    } else {
      setErrors({ otp: result.error });
    }
    
    setLoading(false);
  };

  const formatTime = (seconds) => {
    return `00:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header
        title="Verify Email"
        showBack
        onBackPress={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread" size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          We've sent a verification code to{'\n'}
          <Text style={styles.emailText}>{user?.email}</Text>
        </Text>

        {demoOtp && (
          <View style={styles.demoOtpContainer}>
            <Text style={styles.demoOtpLabel}>Demo OTP (for testing):</Text>
            <Text style={styles.demoOtpValue}>{demoOtp}</Text>
          </View>
        )}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                errors.otp && styles.otpInputError,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

        {/* Timer / Resend */}
        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              Resend OTP in <Text style={styles.timerValue}>{formatTime(timer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleSendOTP}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <Button
          title="Verify"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          style={styles.verifyButton}
        />

        {/* Help Text */}
        <Text style={styles.helpText}>
          Didn't receive the code? Check your spam folder or try resending.
        </Text>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  demoOtpContainer: {
    backgroundColor: Colors.infoLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  demoOtpLabel: {
    fontSize: 12,
    color: Colors.info,
    marginBottom: 4,
  },
  demoOtpValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.info,
    letterSpacing: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.text,
    backgroundColor: Colors.background,
    marginHorizontal: 4,
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 16,
  },
  resendContainer: {
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timerValue: {
    fontWeight: '600',
    color: Colors.primary,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  verifyButton: {
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
