/**
 * AAI Attendance App - Profile Screen
 * User profile and settings
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useAuth, useApp } from '../../context';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/dateUtils';
import { DEPARTMENTS, DESIGNATIONS, AIRPORT_LOCATIONS } from '../../constants/config';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, deviceInfo } = useAuth();
  const { isOnline, settings, saveSettings } = useApp();
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  const handleToggleBiometric = async (value) => {
    const result = await saveSettings({ biometricLock: value });
    if (result.success) {
      setToast({
        visible: true,
        message: `Biometric lock ${value ? 'enabled' : 'disabled'}`,
        type: 'success',
      });
    }
  };

  const handleToggleNotifications = async (key, value) => {
    const result = await saveSettings({
      notifications: { ...settings.notifications, [key]: value },
    });
    if (result.success) {
      setToast({
        visible: true,
        message: 'Notification settings updated',
        type: 'success',
      });
    }
  };

  const getDepartmentName = (id) => DEPARTMENTS.find(d => d.id === id)?.name || id;
  const getDesignationName = (id) => DESIGNATIONS.find(d => d.id === id)?.name || id;
  const getLocationName = (id) => AIRPORT_LOCATIONS.find(l => l.id === id)?.name || id;

  const renderSettingItem = ({ icon, title, subtitle, onPress, toggle, value }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !toggle}
    >
      <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {toggle !== undefined && (
        <View style={[styles.toggle, value && styles.toggleActive]}>
          <View style={[styles.toggleDot, value && styles.toggleDotActive]} />
        </View>
      )}
      {onPress && !toggle && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName}</Text>
              <Text style={styles.profileId}>{user?.employeeId}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <ProfileDetailItem icon="business" label="Department" value={getDepartmentName(user?.department)} />
            <ProfileDetailItem icon="briefcase" label="Designation" value={getDesignationName(user?.designation)} />
            <ProfileDetailItem icon="location" label="Location" value={getLocationName(user?.location)} />
            <ProfileDetailItem icon="mail" label="Email" value={user?.email} />
            <ProfileDetailItem icon="call" label="Phone" value={user?.phone} />
          </View>
        </Card>

        {/* Device Info */}
        <Text style={styles.sectionTitle}>Device Information</Text>
        <Card style={styles.deviceCard}>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>Device</Text>
            <Text style={styles.deviceValue}>{deviceInfo?.modelName || 'Unknown'}</Text>
          </View>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>OS</Text>
            <Text style={styles.deviceValue}>
              {deviceInfo?.osName} {deviceInfo?.osVersion}
            </Text>
          </View>
          <View style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>Registered</Text>
            <Text style={styles.deviceValue}>
              {deviceInfo?.registeredAt ? formatDate(deviceInfo.registeredAt) : 'N/A'}
            </Text>
          </View>
        </Card>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card style={styles.settingsCard}>
          {renderSettingItem({
            icon: 'finger-print',
            title: 'Biometric Lock',
            subtitle: 'Unlock app with fingerprint/Face ID',
            toggle: true,
            value: settings.biometricLock,
            onPress: () => handleToggleBiometric(!settings.biometricLock),
          })}
          {renderSettingItem({
            icon: 'notifications',
            title: 'Attendance Reminders',
            subtitle: 'Daily check-in reminders',
            toggle: true,
            value: settings.notifications.attendanceReminders,
            onPress: () => handleToggleNotifications('attendanceReminders', !settings.notifications.attendanceReminders),
          })}
          {renderSettingItem({
            icon: 'document-text',
            title: 'Leave Notifications',
            subtitle: 'Leave approval updates',
            toggle: true,
            value: settings.notifications.leaveApprovals,
            onPress: () => handleToggleNotifications('leaveApprovals', !settings.notifications.leaveApprovals),
          })}
          {renderSettingItem({
            icon: 'sync',
            title: 'Sync Notifications',
            subtitle: 'Data sync status updates',
            toggle: true,
            value: settings.notifications.syncNotifications,
            onPress: () => handleToggleNotifications('syncNotifications', !settings.notifications.syncNotifications),
          })}
        </Card>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <Text style={styles.sectionTitle}>Admin</Text>
            <Card style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => router.push('/location-management')}
              >
                <View style={[styles.settingIcon, { backgroundColor: Colors.saffron + '15' }]}>
                  <Ionicons name="map" size={20} color={Colors.saffron} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Location Management</Text>
                  <Text style={styles.settingSubtitle}>Manage workplace locations</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon="log-out"
          fullWidth
          style={styles.logoutButton}
        />

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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

const ProfileDetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={18} color={Colors.textLight} />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  deviceCard: {
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  deviceValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.success,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textWhite,
    transform: [{ translateX: 0 }],
  },
  toggleDotActive: {
    transform: [{ translateX: 22 }],
  },
  logoutButton: {
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
});
