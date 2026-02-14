/**
 * AAI Attendance App - Apply Leave Screen
 * Leave application form
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { LEAVE_CONFIG } from '../constants/config';
import { useLeave, useAuth } from '../context';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Toast from '../components/Toast';
import SuccessAnimation from '../components/SuccessAnimation';
import { getWorkingDays, formatDate } from '../utils/dateUtils';

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
    return getWorkingDays(new Date(startDate), new Date(endDate));
  };

  const hasSufficientBalance = () => {
    if (!leaveType) return true;
    const balance = leaveBalances[leaveType]?.remaining || 0;
    return balance >= calculateDays();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    if (!hasSufficientBalance()) {
      newErrors.leaveType = `Insufficient leave balance. You have ${leaveBalances[leaveType]?.remaining || 0} days remaining.`;
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
      if (result.errors) {
        setErrors(result.errors);
      }
      setToast({
        visible: true,
        message: result.errors?.general || 'Failed to apply for leave',
        type: 'error',
      });
    }
  };

  const renderTypePicker = () => {
    if (!showTypePicker) return null;

    return (
      <View style={styles.pickerOverlay}>
        <Card style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>Select Leave Type</Text>
          <ScrollView style={styles.pickerList}>
            {LEAVE_CONFIG.types.map((type) => {
              const balance = leaveBalances[type.id]?.remaining || 0;
              const isSelected = leaveType === type.id;
              
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeItem,
                    isSelected && styles.typeItemSelected,
                  ]}
                  onPress={() => {
                    setLeaveType(type.id);
                    setShowTypePicker(false);
                    setErrors({ ...errors, leaveType: null });
                  }}
                >
                  <View style={styles.typeItemLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                      <Ionicons name={type.icon} size={20} color={type.color} />
                    </View>
                    <View>
                      <Text style={styles.typeName}>{type.name}</Text>
                      <Text style={styles.typeBalance}>
                        Balance: {balance} days
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowTypePicker(false)}
            style={styles.pickerCancel}
          />
        </Card>
      </View>
    );
  };

  const renderFormStep = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.subtitle}>
        Fill in the details to apply for leave
      </Text>

      {/* Leave Type */}
      <TouchableOpacity
        style={[styles.pickerButton, errors.leaveType && styles.pickerButtonError]}
        onPress={() => setShowTypePicker(true)}
      >
        <Text style={styles.pickerButtonLabel}>Leave Type</Text>
        <View style={styles.pickerButtonContent}>
          {leaveType ? (
            <View style={styles.selectedType}>
              <View style={[styles.selectedTypeIcon, { backgroundColor: getLeaveTypeColor(leaveType) + '20' }]}>
                <Ionicons
                  name={LEAVE_CONFIG.types.find(t => t.id === leaveType)?.icon}
                  size={18}
                  color={getLeaveTypeColor(leaveType)}
                />
              </View>
              <Text style={styles.selectedTypeText}>{getLeaveTypeName(leaveType)}</Text>
            </View>
          ) : (
            <Text style={styles.pickerButtonPlaceholder}>Select leave type</Text>
          )}
          <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
        </View>
      </TouchableOpacity>
      {errors.leaveType && <Text style={styles.errorText}>{errors.leaveType}</Text>}

      {/* Date Range */}
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Input
            label="From Date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={(text) => {
              setStartDate(text);
              setErrors({ ...errors, startDate: null });
            }}
            icon="calendar"
            error={errors.startDate}
          />
        </View>
        <View style={styles.dateField}>
          <Input
            label="To Date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={(text) => {
              setEndDate(text);
              setErrors({ ...errors, endDate: null });
            }}
            icon="calendar"
            error={errors.endDate}
          />
        </View>
      </View>

      {/* Days Calculation */}
      {startDate && endDate && (
        <Card style={styles.daysCard}>
          <View style={styles.daysRow}>
            <Text style={styles.daysLabel}>Number of Days:</Text>
            <Text style={styles.daysValue}>{calculateDays()}</Text>
          </View>
          {leaveType && (
            <View style={styles.daysRow}>
              <Text style={styles.daysLabel}>Remaining After:</Text>
              <Text style={styles.daysValue}>
                {(leaveBalances[leaveType]?.remaining || 0) - calculateDays()}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Reason */}
      <Input
        label="Reason for Leave"
        placeholder="Please provide a detailed reason for your leave request..."
        value={reason}
        onChangeText={(text) => {
          setReason(text);
          setErrors({ ...errors, reason: null });
        }}
        multiline
        numberOfLines={4}
        maxLength={200}
        error={errors.reason}
      />
      <Text style={styles.charCount}>{reason.length}/200</Text>

      {/* Submit Button */}
      <Button
        title="Submit Application"
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        style={styles.submitButton}
      />
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <SuccessAnimation
      visible={true}
      title="Application Submitted!"
      message="Your leave application has been submitted successfully and is pending approval."
      onComplete={() => router.replace('/(tabs)/leaves')}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header
        title="Apply for Leave"
        showBack
        onBackPress={() => router.back()}
      />

      {currentStep === STEPS.FORM && renderFormStep()}
      {currentStep === STEPS.SUCCESS && renderSuccessStep()}

      {renderTypePicker()}

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
    padding: 16,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: Colors.background,
  },
  pickerButtonError: {
    borderColor: Colors.error,
  },
  pickerButtonLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  selectedType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedTypeText: {
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 8,
  },
  daysCard: {
    marginBottom: 16,
    backgroundColor: Colors.primary + '08',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  daysLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  daysValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  pickerCard: {
    width: '100%',
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerList: {
    maxHeight: 300,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  typeItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  typeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  typeBalance: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  pickerCancel: {
    margin: 16,
  },
});
