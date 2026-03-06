/**
 * AAI Attendance App - Login Screen
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../constants/colors';
import { APP_INFO } from '../constants/config';
import { useAuth } from '../context';
import Input from '../components/Input';
import Toast from '../components/Toast';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const passwordRef = useRef(null);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!employeeId.trim()) newErrors.employeeId = 'Required';
    if (!password) newErrors.password = 'Required';

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
        message: result.error || 'Invalid credentials',
        type: 'error',
      });
    }
  }, [validateForm, login, employeeId, password, router]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Premium Background Gradient */}
      <LinearGradient
        colors={['#003366', '#001A33']}
        style={styles.bgGradient}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerSection}>
                <View style={styles.logoBox}>
                  <Ionicons name="airplane" size={40} color="#FF9933" />
                </View>
                <Text style={styles.appName}>AAI PORTAL</Text>
                <Text style={styles.tagline}>Aviation Personnel Attendance System</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Sign In</Text>
                <Text style={styles.cardSubtitle}>Access your secure workstation</Text>

                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>EMPLOYEE ID</Text>
                    <View style={[styles.inputContainer, errors.employeeId && styles.inputError]}>
                      <Ionicons name="card-outline" size={20} color="#94A3B8" />
                      <Input
                        placeholder="AA100001"
                        value={employeeId}
                        onChangeText={setEmployeeId}
                        autoCapitalize="characters"
                        inputContainerStyle={styles.headlessInput}
                        inputStyle={styles.textInput}
                        containerStyle={{ flex: 1 }}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                      />
                    </View>
                    {errors.employeeId && <Text style={styles.errorText}>{errors.employeeId}</Text>}
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                      <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                      <Input
                        ref={passwordRef}
                        placeholder="Enter password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        inputContainerStyle={styles.headlessInput}
                        inputStyle={styles.textInput}
                        containerStyle={{ flex: 1 }}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push('/forgot-password')}
                    style={styles.forgotBtn}
                  >
                    <Text style={styles.forgotText}>Request Access Recovery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={styles.loginBtn}
                  >
                    <LinearGradient
                      colors={['#003366', '#0055AA']}
                      style={styles.btnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.btnText}>AUTHENTICATE</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.registerBox}>
                    <Text style={styles.registerLabel}>New Personnel?</Text>
                    <TouchableOpacity onPress={() => router.push('/register')}>
                      <Text style={styles.registerLink}>Register Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.govNotice}>OFFICIAL GOVERNMENT OF INDIA PORTAL</Text>
                <Text style={styles.securityNotice}>Authorized Access Only • End-to-End Encrypted</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgGradient: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  headerSection: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoBox: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(255,153,51,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,153,51,0.3)' },
  appName: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6, fontWeight: '600' },

  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  cardSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '500' },

  form: { marginTop: 28 },
  field: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1.5, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  inputError: { borderColor: '#EF4444' },
  headlessInput: { flex: 1, borderWidth: 0, backgroundColor: 'transparent', marginBottom: 0, height: 52 },
  textInput: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 4, fontWeight: '600' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 28 },
  forgotText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  loginBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  registerBox: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 },
  registerLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  registerLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  footer: { marginTop: 'auto', paddingTop: 40, alignItems: 'center' },
  govNotice: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 },
  securityNotice: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: '600' },
});
