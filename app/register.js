/**
 * AAI Attendance App - Registration Screen
 * New employee registration
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { DEPARTMENTS, DESIGNATIONS, AIRPORT_LOCATIONS } from '../constants/config';
import { useAuth } from '../context';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Header from '../components/Header';

import Toast from '../components/Toast';
import { getPasswordStrength } from '../utils/validationUtils';

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
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showDesignationPicker, setShowDesignationPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const handleEmployeeIdChange = useCallback((text) => {
    updateField('employeeId', text.toUpperCase());
  }, [updateField]);

  // 2. Full Name (plain text)
  const handleFullNameChange = useCallback((text) => {
    updateField('fullName', text);
  }, [updateField]);

  // 3. Email (lowercase transformation)
  const handleEmailChange = useCallback((text) => {
    updateField('email', text.toLowerCase());
  }, [updateField]);

  // 4. Phone (plain text, has maxLength in Input)
  const handlePhoneChange = useCallback((text) => {
    updateField('phone', text);
  }, [updateField]);

  // 5. Password
  const handlePasswordChange = useCallback((text) => {
    updateField('password', text);
  }, [updateField]);

  // 6. Confirm Password
  const handleConfirmPasswordChange = useCallback((text) => {
    updateField('confirmPassword', text);
  }, [updateField]);

  // 7. Accept Terms (toggle)
  const handleAcceptTerms = useCallback(() => {
    updateField('acceptTerms', !formData.acceptTerms);
  }, [formData.acceptTerms, updateField]);

  // 8. Department Select
  const handleDepartmentSelect = useCallback((id) => {
    updateField('department', id);
  }, [updateField]);

  // 9. Designation Select
  const handleDesignationSelect = useCallback((id) => {
    updateField('designation', id);
  }, [updateField]);

  // 10. Location Select
  const handleLocationSelect = useCallback((id) => {
    updateField('location', id);
  }, [updateField]);

  // For closing pickers
  const handleCloseDepartmentPicker = useCallback(() => {
    setShowDepartmentPicker(false);
  }, []);

  const handleCloseDesignationPicker = useCallback(() => {
    setShowDesignationPicker(false);
  }, []);

  const handleCloseLocationPicker = useCallback(() => {
    setShowLocationPicker(false);
  }, []);




  const handleRegister = async () => {
    const result = await register(formData);

    if (result.success) {
      setToast({
        visible: true,
        message: result.message,
        type: 'success',
      });
      // Navigate back to login after successful registration
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      setToast({
        visible: true,
        message: result.errors?.general || 'Registration failed',
        type: 'error',
      });
    }
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );
  const strengthColor = useMemo(
    () => ({
      weak: Colors.error,
      medium: Colors.warning,
      strong: Colors.success,
    }[passwordStrength]),
    [passwordStrength]
  );

  const renderPicker = useCallback((title, items, selectedValue, onSelect, visible, setVisible) => {
    if (!visible) return null;

    return (
      <View style={styles.pickerOverlay}>
        <Card style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <ScrollView style={styles.pickerList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pickerItem,
                  selectedValue === item.id && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  onSelect(item.id);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedValue === item.id && styles.pickerItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedValue === item.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setVisible(false)}
            style={styles.pickerCancel}
          />
        </Card>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header
        title="Employee Registration"
        showBack
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Create your AAI Attendance account
          </Text>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <Input
              label="Employee ID"
              placeholder="e.g., AA100001"
              value={formData.employeeId}
              onChangeText={handleEmployeeIdChange}
              icon="card"
              autoCapitalize="characters"
              error={errors.employeeId}
              required
            />

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={handleFullNameChange}
              icon="person"
              error={errors.fullName}
              required
            />

            <Input
              label="Email Address"
              placeholder="your.email@aai.aero"
              value={formData.email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              icon="mail"
              error={errors.email}
              required
            />

            <Input
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
              icon="call"
              error={errors.phone}
              required
            />
          </View>

          {/* Work Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Information</Text>

            {/* Department Picker */}
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDepartmentPicker(true)}
            >
              <Text style={styles.pickerButtonLabel}>Department</Text>
              <Text style={styles.pickerButtonValue}>
                {formData.department
                  ? DEPARTMENTS.find(d => d.id === formData.department)?.name
                  : 'Select Department'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {errors.department && (
              <Text style={styles.errorText}>{errors.department}</Text>
            )}

            {/* Designation Picker */}
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDesignationPicker(true)}
            >
              <Text style={styles.pickerButtonLabel}>Designation</Text>
              <Text style={styles.pickerButtonValue}>
                {formData.designation
                  ? DESIGNATIONS.find(d => d.id === formData.designation)?.name
                  : 'Select Designation'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {errors.designation && (
              <Text style={styles.errorText}>{errors.designation}</Text>
            )}

            {/* Location Picker */}
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.pickerButtonLabel}>Assigned Location</Text>
              <Text style={styles.pickerButtonValue}>
                {formData.location
                  ? AIRPORT_LOCATIONS.find(l => l.id === formData.location)?.name
                  : 'Select Location'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Set Password</Text>

            <Input
              label="Password"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
              value={formData.password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              icon="lock-closed"
              error={errors.password}
              required
            />

            {formData.password && (
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
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              icon="lock-closed"
              error={errors.confirmPassword}
              required
            />
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={handleAcceptTerms}
          >
            <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
              {formData.acceptTerms && (
                <Ionicons name="checkmark" size={16} color={Colors.textWhite} />
              )}
            </View>
            <Text style={styles.termsText}>
              I accept the Terms & Conditions and Privacy Policy
            </Text>
          </TouchableOpacity>
          {errors.acceptTerms && (
            <Text style={styles.errorText}>{errors.acceptTerms}</Text>
          )}

          {/* Submit Button */}
          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerButton}
          />

          <Text style={styles.note}>
            Note: Your account will be pending admin approval after registration.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pickers */}
      {renderPicker(
        'Select Department',
        DEPARTMENTS,
        formData.department,
        handleDepartmentSelect,  // ✅ Use the stable callback
        showDepartmentPicker,
        handleCloseDepartmentPicker  // ✅ Use the stable callback
      )}
      {renderPicker(
        'Select Designation',
        DESIGNATIONS,
        formData.designation,
        handleDesignationSelect,  // ✅ Use the stable callback
        showDesignationPicker,
        handleCloseDesignationPicker  // ✅ Use the stable callback
      )}
      {renderPicker(
        'Select Location',
        AIRPORT_LOCATIONS,
        formData.location,
        handleLocationSelect,  // ✅ Use the stable callback
        showLocationPicker,
        handleCloseLocationPicker  // ✅ Use the stable callback
      )}

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  pickerButtonLabel: {
    fontSize: 12,
    color: Colors.textLight,
    position: 'absolute',
    left: 12,
    top: 6,
  },
  pickerButtonValue: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginTop: 10,
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
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  pickerCancel: {
    margin: 16,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  registerButton: {
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -12,
    marginBottom: 12,
  },
});
