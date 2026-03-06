/**
 * AAI Attendance App - Registration Screen
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../constants/colors';
import { DEPARTMENTS, DESIGNATIONS, AIRPORT_LOCATIONS } from '../constants/config';
import { useAuth } from '../context';
import Input from '../components/Input';
import Toast from '../components/Toast';
import { getPasswordStrength } from '../utils/validationUtils';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    location: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const [activePicker, setActivePicker] = useState(null); // 'dept', 'desig', 'loc'

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const handleRegister = async () => {
    const result = await register(formData);
    if (result.success) {
      setToast({ visible: true, message: 'Registration Successful! Waiting for admin approval.', type: 'success' });
      setTimeout(() => router.replace('/login'), 2500);
    } else {
      if (result.errors) setErrors(result.errors);
      setToast({ visible: true, message: result.error || 'Registration failed', type: 'error' });
    }
  };

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const sColor = { weak: '#EF4444', medium: '#F59E0B', strong: '#10B981' }[strength];

  const renderModal = (title, items, field) => {
    if (activePicker !== field) return null;
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setActivePicker(null)}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.typeItem, formData[field] === item.id && styles.typeItemSelected]}
                onPress={() => { updateField(field, item.id); setActivePicker(null); }}
              >
                <Text style={[styles.typeName, formData[field] === item.id && { color: Colors.primary }]}>{item.name}</Text>
                {formData[field] === item.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Enrollment</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.introBox}>
            <Text style={styles.introTitle}>Account Setup</Text>
            <Text style={styles.introSub}>Please provide your official workstation details for verification.</Text>
          </View>

          {/* Personal Section */}
          <SectionTitle title="PERSONAL IDENTITY" />
          <View style={styles.card}>
            <Field label="EMPLOYEE ID" error={errors.employeeId}>
              <View style={styles.inputBox}>
                <Ionicons name="card-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="AA100001"
                  value={formData.employeeId}
                  autoCapitalize="characters"
                  onChangeText={v => updateField('employeeId', v)}
                />
              </View>
            </Field>

            <Field label="FULL NAME" error={errors.fullName}>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChangeText={v => updateField('fullName', v)}
                />
              </View>
            </Field>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="EMAIL" error={errors.email}>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="work@aai.aero"
                      value={formData.email}
                      keyboardType="email-address"
                      onChangeText={v => updateField('email', v.toLowerCase())}
                    />
                  </View>
                </Field>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Field label="PHONE" error={errors.phone}>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="10 digits"
                      value={formData.phone}
                      keyboardType="phone-pad"
                      maxLength={10}
                      onChangeText={v => updateField('phone', v)}
                    />
                  </View>
                </Field>
              </View>
            </View>
          </View>

          {/* Work Section */}
          <SectionTitle title="WORK ASSIGNMENT" />
          <View style={styles.card}>
            <Field label="DEPARTMENT" error={errors.department}>
              <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('department')}>
                <Text style={[styles.selectorT, !formData.department && { color: '#94A3B8' }]}>
                  {formData.department ? DEPARTMENTS.find(d => d.id === formData.department)?.name : 'Select Department'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="DESIGNATION" error={errors.designation}>
              <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('designation')}>
                <Text style={[styles.selectorT, !formData.designation && { color: '#94A3B8' }]}>
                  {formData.designation ? DESIGNATIONS.find(d => d.id === formData.designation)?.name : 'Select Designation'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="ASSIGNED STATION" error={errors.location} isLast>
              <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('location')}>
                <Text style={[styles.selectorT, !formData.location && { color: '#94A3B8' }]}>
                  {formData.location ? AIRPORT_LOCATIONS.find(l => l.id === formData.location)?.name : 'Select Airport Location'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </Field>
          </View>

          {/* Security Section */}
          <SectionTitle title="SECURITY" />
          <View style={styles.card}>
            <Field label="PORTAL PASSWORD" error={errors.password}>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Create password"
                  value={formData.password}
                  secureTextEntry
                  onChangeText={v => updateField('password', v)}
                />
              </View>
              {formData.password.length > 0 && (
                <View style={styles.sBarWrap}>
                  <View style={[styles.sBar, { width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%', backgroundColor: sColor }]} />
                </View>
              )}
            </Field>

            <Field label="CONFIRM PASSWORD" error={errors.confirmPassword} isLast>
              <View style={styles.inputBox}>
                <Ionicons name="shield-outline" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  secureTextEntry
                  onChangeText={v => updateField('confirmPassword', v)}
                />
              </View>
            </Field>
          </View>

          {/* Terms */}
          <TouchableOpacity style={styles.terms} onPress={() => updateField('acceptTerms', !formData.acceptTerms)}>
            <View style={[styles.check, formData.acceptTerms && { backgroundColor: Colors.primary }]}>
              {formData.acceptTerms && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.termsT}>I confirm the information above is accurate for office records.</Text>
          </TouchableOpacity>
          {errors.acceptTerms && <Text style={styles.errorH}>{errors.acceptTerms}</Text>}

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={['#003366', '#0055AA']} style={styles.btnG} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.btnT}>REQUEST ENROLLMENT</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.note}>Submission will be reviewed by the Airport Authority Admin.</Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {renderModal('Department', DEPARTMENTS, 'department')}
      {renderModal('Designation', DESIGNATIONS, 'designation')}
      {renderModal('Location', AIRPORT_LOCATIONS, 'location')}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />
    </SafeAreaView>
  );
}

const SectionTitle = ({ title }) => (
  <View style={styles.sectionH}>
    <Text style={styles.sectionT}>{title}</Text>
  </View>
);

const Field = ({ label, children, error, isLast }) => (
  <View style={[styles.field, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.label}>{label}</Text>
    {children}
    {error && <Text style={styles.errorH}>{error}</Text>}
  </View>
);



const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F6FA' },
  navHeader: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, paddingHorizontal: 12 },
  navBack: { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  scrollContent: { paddingBottom: 40 },
  introBox: { padding: 20 },
  introTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  introSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  sectionH: { marginHorizontal: 20, marginTop: 10, marginBottom: 8 },
  sectionT: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },

  card: { backgroundColor: '#FFF', marginHorizontal: 14, borderRadius: 24, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  field: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  label: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#334155', paddingVertical: 4 },

  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorT: { fontSize: 15, fontWeight: '700', color: '#334155' },

  row: { flexDirection: 'row' },
  sBarWrap: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  sBar: { height: '100%' },

  terms: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 24 },
  check: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  termsT: { flex: 1, fontSize: 12, color: '#64748B', fontWeight: '500', lineHeight: 18 },

  submitBtn: { marginHorizontal: 14, marginTop: 32, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6 },
  btnG: { paddingVertical: 18, alignItems: 'center' },
  btnT: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  errorH: { color: '#EF4444', fontSize: 10, fontWeight: '700', marginTop: 4 },
  note: { textAlign: 'center', padding: 20, fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', zIndex: 1000 },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  modalBody: { padding: 10 },
  typeItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 },
  typeItemSelected: { backgroundColor: Colors.primary + '08' },
  typeName: { fontSize: 15, fontWeight: '700', color: '#334155' },
});
