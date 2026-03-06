/**
 * AAI Attendance App - Apply Leave Screen
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../constants/colors';
import { LEAVE_CONFIG } from '../constants/config';
import { useLeave, useAuth } from '../context';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { getWorkingDays, formatDate } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const STEPS = {
  FORM: 'form',
  SUCCESS: 'success',
};

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { leaveBalances, applyForLeave, loading, getLeaveTypeColor, getLeaveTypeName } = useLeave();

  const [currentStep, setCurrentStep] = useState(STEPS.FORM);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [showTypePicker, setShowTypePicker] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) return 0;
      return getWorkingDays(start, end);
    } catch {
      return 0;
    }
  };

  const hasSufficientBalance = () => {
    if (!leaveType) return true;
    const balance = leaveBalances[leaveType]?.remaining || 0;
    return balance >= calculateDays();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!leaveType) newErrors.leaveType = 'Selection required';
    if (!startDate) newErrors.startDate = 'Required';
    if (!endDate) newErrors.endDate = 'Required';

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (s > e) newErrors.endDate = 'Must be after start';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Minimum 10 characters';
    }

    if (!hasSufficientBalance()) {
      newErrors.leaveType = `Insufficient balance (${leaveBalances[leaveType]?.remaining || 0} left)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await applyForLeave({
      leaveType,
      startDate,
      endDate,
      reason,
    });

    if (result.success) {
      setCurrentStep(STEPS.SUCCESS);
    } else {
      setToast({
        visible: true,
        message: result.error || 'Submission failed. Please check network.',
        type: 'error',
      });
    }
  };

  const renderTypePicker = () => {
    if (!showTypePicker) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Leave Categories</Text>
            <TouchableOpacity onPress={() => setShowTypePicker(false)}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {LEAVE_CONFIG.types.map((type) => {
              const balance = leaveBalances[type.id]?.remaining || 0;
              const isSelected = leaveType === type.id;

              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeItem, isSelected && styles.typeItemSelected]}
                  onPress={() => {
                    setLeaveType(type.id);
                    setShowTypePicker(false);
                    setErrors({ ...errors, leaveType: null });
                  }}
                >
                  <View style={[styles.typeIcon, { backgroundColor: type.color + '15' }]}>
                    <Ionicons name={type.icon} size={20} color={type.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeName}>{type.name}</Text>
                    <Text style={styles.typeSub}>{balance} days available</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (currentStep === STEPS.SUCCESS) {
    return (
      <View style={styles.successRoot}>
        <StatusBar style="light" />
        <LinearGradient colors={['#003366', '#0055AA']} style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="send" size={40} color="#FFF" style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.successT}>Application Sent</Text>
          <Text style={styles.successP}>Your leave request has been submitted for approval.</Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace('/(tabs)/leaves')}
          >
            <Text style={styles.doneBtnText}>Return to Leaves</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header title="Request Leave" showBack onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitleText}>Submit Application</Text>
          <Text style={styles.headerSubtitleText}>Ensure your reason is clear for quick approval.</Text>
        </View>

        {/* Leave Type Selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <TouchableOpacity
            style={[styles.selector, errors.leaveType && styles.selectorError]}
            onPress={() => setShowTypePicker(true)}
            activeOpacity={0.7}
          >
            {leaveType ? (
              <View style={styles.selectedRow}>
                <Ionicons name={LEAVE_CONFIG.types.find(t => t.id === leaveType)?.icon} size={18} color={getLeaveTypeColor(leaveType)} />
                <Text style={styles.selectedText}>{getLeaveTypeName(leaveType)}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select leave type</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
          </TouchableOpacity>
          {errors.leaveType && <Text style={styles.errorHint}>{errors.leaveType}</Text>}
        </View>

        {/* Date Row */}
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>START DATE</Text>
            <View style={[styles.inputBox, errors.startDate && styles.inputBoxError]}>
              <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={t => { setStartDate(t); setErrors({ ...errors, startDate: null }) }}
              />
            </View>
            {errors.startDate && <Text style={styles.errorHint}>{errors.startDate}</Text>}
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>END DATE</Text>
            <View style={[styles.inputBox, errors.endDate && styles.inputBoxError]}>
              <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={t => { setEndDate(t); setErrors({ ...errors, endDate: null }) }}
              />
            </View>
            {errors.endDate && <Text style={styles.errorHint}>{errors.endDate}</Text>}
          </View>
        </View>

        {/* Days Preview */}
        {startDate && endDate && calculateDays() > 0 && (
          <View style={styles.previewCard}>
            <View style={styles.previewLine}>
              <Text style={styles.previewLabel}>Total Days</Text>
              <Text style={styles.previewVal}>{calculateDays()} Days</Text>
            </View>
            {leaveType && (
              <View style={[styles.previewLine, { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 10, paddingTop: 10 }]}>
                <Text style={styles.previewLabel}>Projected Balance</Text>
                <Text style={[styles.previewVal, { color: Colors.primary }]}>
                  {(leaveBalances[leaveType]?.remaining || 0) - calculateDays()} Remaining
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reason Field */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>REASON FOR LEAVE</Text>
          <View style={[styles.areaBox, errors.reason && styles.areaBoxError]}>
            <TextInput
              style={styles.areaInput}
              placeholder="Provide a valid reason for office records..."
              multiline
              numberOfLines={4}
              maxLength={200}
              value={reason}
              onChangeText={t => { setReason(t); setErrors({ ...errors, reason: null }) }}
            />
            <Text style={styles.charC}>{reason.length}/200</Text>
          </View>
          {errors.reason && <Text style={styles.errorHint}>{errors.reason}</Text>}
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#003366', '#0055AA']}
            style={styles.btnG}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : (
              <>
                <Text style={styles.btnT}>Submit Request</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {renderTypePicker()}

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
  root: { flex: 1, backgroundColor: '#F3F6FA' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerInfo: { marginBottom: 24 },
  headerTitleText: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  headerSubtitleText: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontWeight: '500' },

  fieldSection: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 8 },

  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
  },
  selectorError: { borderColor: '#EF4444' },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectedText: { fontSize: 15, fontWeight: '700', color: '#334155' },
  placeholderText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  dateCol: { flex: 1 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputBoxError: { borderColor: '#EF4444' },
  input: { flex: 1, paddingVertical: 14, marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#334155' },

  areaBox: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  areaBoxError: { borderColor: '#EF4444' },
  areaInput: { height: 100, textAlignVertical: 'top', fontSize: 14, fontWeight: '600', color: '#334155' },
  charC: { textAlign: 'right', fontSize: 10, color: '#94A3B8', fontWeight: '700' },

  previewCard: { backgroundColor: Colors.primary + '08', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary + '15' },
  previewLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  previewVal: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },

  submitBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6 },
  btnG: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  btnT: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  errorHint: { color: '#EF4444', fontSize: 10, fontWeight: '700', marginTop: 4, marginLeft: 4 },

  // Modal
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', zIndex: 1000 },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  modalBody: { padding: 10 },
  typeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 4 },
  typeItemSelected: { backgroundColor: Colors.primary + '08' },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  typeName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  typeSub: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '600' },

  // Success
  successRoot: { flex: 1 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successT: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  successP: { fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  doneBtn: { backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, marginTop: 40 },
  doneBtnText: { color: Colors.primary, fontWeight: '800', fontSize: 16 },
});
