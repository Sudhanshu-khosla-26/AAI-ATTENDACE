/**
 * AAI Attendance App - Forgot Password Screen
 * Password recovery flow
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { useAuth } from '../context';
import Button from '../components/Button';
import Input from '../components/Input';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { validatePassword, getPasswordStrength } from '../utils/validationUtils';

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  RESET: 'reset',
  SUCCESS: 'success',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { generateOTP, verifyOTP, resetPassword } = useAuth();

  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [demoOtp, setDemoOtp] = useState('');

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    const result = await generateOTP(email);
    setLoading(false);

    if (result.success) {
      setDemoOtp(result.demoOtp);
      setCurrentStep(STEPS.OTP);
      setToast({
        visible: true,
        message: 'OTP sent to your email',
        type: 'success',
      });
    } else {
      setErrors({ email: result.error });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(otp);
    setLoading(false);

    if (result.success) {
      setCurrentStep(STEPS.RESET);
    } else {
      setErrors({ otp: result.error });
    }
  };

  const handleResetPassword = async () => {
    const validation = validatePassword(newPassword);
    
    if (!validation.isValid) {
      setErrors({ newPassword: validation.errors[0] });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, newPassword);
    setLoading(false);

    if (result.success) {
      setCurrentStep(STEPS.SUCCESS);
    } else {
      setToast({
        visible: true,
        message: result.error,
        type: 'error',
      });
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColor = {
    weak: Colors.error,
    medium: Colors.warning,
    strong: Colors.success,
  }[passwordStrength];

  const renderEmailStep = () => (
    <View>
      <View style={styles.iconContainer}>
        <Ionicons name="mail" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>
        Enter your registered email address and we'll send you an OTP to reset your password.
      </Text>
      
      <Input
        label="Email Address"
        placeholder="your.email@aai.aero"
        value={email}
        onChangeText={(text) => {
          setEmail(text.toLowerCase());
          setErrors({});
        }}
        keyboardType="email-address"
        icon="mail"
        error={errors.email}
        autoCapitalize="none"
      />

      <Button
        title="Send OTP"
        onPress={handleSendOTP}
        loading={loading}
        fullWidth
      />
    </View>
  );

  const renderOTPStep = () => (
    <View>
      <View style={styles.iconContainer}>
        <Ionicons name="keypad" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Enter OTP</Text>
      <Text style={styles.stepDescription}>
        We've sent a 6-digit OTP to {email}
      </Text>
      
      {demoOtp && (
        <View style={styles.demoOtpContainer}>
          <Text style={styles.demoOtpLabel}>Demo OTP (for testing):</Text>
          <Text style={styles.demoOtpValue}>{demoOtp}</Text>
        </View>
      )}

      <Input
        label="OTP"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={(text) => {
          setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
          setErrors({});
        }}
        keyboardType="number-pad"
        maxLength={6}
        icon="key"
        error={errors.otp}
      />

      <Button
        title="Verify OTP"
        onPress={handleVerifyOTP}
        loading={loading}
        fullWidth
      />

      <Button
        title="Resend OTP"
        onPress={handleSendOTP}
        variant="ghost"
        style={styles.resendButton}
      />
    </View>
  );

  const renderResetStep = () => (
    <View>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-open" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Create New Password</Text>
      <Text style={styles.stepDescription}>
        Create a strong password for your account
      </Text>

      <Input
        label="New Password"
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setErrors({});
        }}
        secureTextEntry
        icon="lock-closed"
        error={errors.newPassword}
      />

      {newPassword && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                  backgroundColor: strengthColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: strengthColor }]}>
            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
          </Text>
        </View>
      )}

      <Input
        label="Confirm Password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setErrors({});
        }}
        secureTextEntry
        icon="lock-closed"
        error={errors.confirmPassword}
      />

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={loading}
        fullWidth
      />
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={[styles.iconContainer, styles.successIcon]}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
      </View>
      <Text style={styles.stepTitle}>Password Reset Successful!</Text>
      <Text style={styles.stepDescription}>
        Your password has been reset successfully. You can now login with your new password.
      </Text>

      <Button
        title="Back to Login"
        onPress={() => router.replace('/login')}
        fullWidth
        style={styles.successButton}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return renderEmailStep();
      case STEPS.OTP:
        return renderOTPStep();
      case STEPS.RESET:
        return renderResetStep();
      case STEPS.SUCCESS:
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header
        title="Forgot Password"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
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
  successIcon: {
    backgroundColor: Colors.success + '15',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  demoOtpContainer: {
    backgroundColor: Colors.infoLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  demoOtpLabel: {
    fontSize: 12,
    color: Colors.info,
    marginBottom: 4,
  },
  demoOtpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.info,
    letterSpacing: 4,
  },
  resendButton: {
    marginTop: 16,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 10,
    minWidth: 60,
    textAlign: 'right',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  successButton: {
    marginTop: 32,
  },
});
