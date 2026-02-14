import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { APP_INFO } from '../constants/config';
import { useAuth } from '../context';
import Button from '../components/Button';
import Input from '../components/Input';
import AAILogo from '../components/AAILogo';
import Toast from '../components/Toast';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();

  // State
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  // Refs can help prevent unnecessary focus jumps
  const passwordRef = useRef(null);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [employeeId, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    const result = await login(employeeId.trim(), password);

    if (result.success) {
      if (result.requiresEmailVerification) {
        router.replace('/verify-otp');
      } else if (result.requiresPhotoVerification) {
        router.replace('/photo-verification');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      setToast({
        visible: true,
        message: result.error || 'Login failed',
        type: 'error',
      });
    }
  }, [validateForm, login, employeeId, password, router]);

  // ✅ FIX 1: Use native autoCapitalize instead of manual state manipulation
  // Manual .toUpperCase() in onChangeText often resets the cursor position 
  // and causes focus jumps in some custom Input components.
  const handleEmployeeIdChange = (text) => {
    setEmployeeId(text);
    // Optional: Clear error when user starts typing again
    if (errors.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: null }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };

  const handleToastHide = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        // ✅ FIX 2: Use 'padding' for iOS and null/height for Android 
        // to prevent the layout from "shaking" the focus.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always" // Better for form focus
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <AAILogo size="medium" showText={false} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your AAI account</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Employee ID"
              placeholder="AA100001"
              value={employeeId}
              onChangeText={handleEmployeeIdChange}
              icon="person"
              autoCapitalize="characters" // Let the OS handle the uppercase
              error={errors.employeeId}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()} // Move focus manually
            />

            <Input
              ref={passwordRef} // Ensure your custom Input component uses forwardRef
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              icon="lock-closed"
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>New Employee? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Register Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{APP_INFO.governmentNotice}</Text>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={handleToastHide}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  titleContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary },
  form: { width: '100%' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  loginButton: { marginBottom: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  footerText: { fontSize: 11, color: Colors.textLight, textAlign: 'center' },
});

