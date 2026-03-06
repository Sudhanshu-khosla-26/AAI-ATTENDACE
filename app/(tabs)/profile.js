/**
 * AAI Attendance App - Profile Screen
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/colors';
import { useAuth, useApp } from '../../context';
import { API_BASE_URL } from '../../constants/api';
import Header from '../../components/Header';
import Toast from '../../components/Toast';
import { formatDate } from '../../utils/dateUtils';
import { DEPARTMENTS, DESIGNATIONS, AIRPORT_LOCATIONS } from '../../constants/config';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, deviceInfo } = useAuth();
  const { settings, saveSettings } = useApp();

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from AAI Portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
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
        message: `Security Lock ${value ? 'Enabled' : 'Disabled'}`,
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
        message: 'Preference Updated',
        type: 'success',
      });
    }
  };

  const getDepartmentName = (id) => DEPARTMENTS.find(d => d.id === id)?.name || id;
  const getDesignationName = (id) => DESIGNATIONS.find(d => d.id === id)?.name || id;
  const getLocationName = (id) => AIRPORT_LOCATIONS.find(l => l.id === id)?.name || id;

  const renderSettingItem = ({ icon, title, subtitle, onPress, toggle, value, color = Colors.primary }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !toggle}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {toggle !== undefined ? (
        <TouchableOpacity
          onPress={onPress}
          style={[styles.toggle, value && { backgroundColor: '#10B981' }]}
        >
          <View style={[styles.toggleDot, value && { transform: [{ translateX: 18 }] }]} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header title="My Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#003366', '#0055AA']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileMain}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarInner}>
                  {user?.photoUrl ? (
                    <Image
                      source={{ uri: `${API_BASE_URL}${user.photoUrl}` }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarInitials}>
                      {(user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.editAvatar}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.nameHeader}>
                <Text style={styles.profileName}>{user?.fullName}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
                <Text style={styles.employeeId}>Employee ID: {user?.employeeId}</Text>
              </View>
            </View>

            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DUTY STATUS</Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>ACTIVE</Text>
                </View>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>OFFICE</Text>
                <Text style={styles.statValue}>{getLocationName(user?.location)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EMPLOYMENT DETAILS</Text>
        </View>
        <View style={styles.card}>
          <DetailItem icon="business-outline" label="Department" value={getDepartmentName(user?.department)} />
          <DetailItem icon="briefcase-outline" label="Designation" value={getDesignationName(user?.designation)} />
          <DetailItem icon="mail-outline" label="Official Email" value={user?.email} />
          <DetailItem icon="call-outline" label="Contact Number" value={user?.phone} isLast />
        </View>

        {/* Device Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>REGISTERED DEVICE</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.deviceRow}>
            <View style={styles.deviceIcon}>
              <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceModel}>{deviceInfo?.modelName || 'Mobile Device'}</Text>
              <Text style={styles.deviceOs}>{deviceInfo?.osName} {deviceInfo?.osVersion}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#10B981" />
              <Text style={styles.verifiedText}>SECURED</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
        </View>
        <View style={styles.card}>
          {renderSettingItem({
            icon: 'finger-print-outline',
            title: 'Biometric Security',
            subtitle: 'Fingerprint or Face ID login',
            toggle: true,
            value: settings.biometricLock,
            onPress: () => handleToggleBiometric(!settings.biometricLock),
            color: '#0055AA'
          })}
          {renderSettingItem({
            icon: 'notifications-outline',
            title: 'Duty Reminders',
            subtitle: 'Daily check-in alerts',
            toggle: true,
            value: settings.notifications.attendanceReminders,
            onPress: () => handleToggleNotifications('attendanceReminders', !settings.notifications.attendanceReminders),
            color: '#10B981'
          })}
          {renderSettingItem({
            icon: 'document-text-outline',
            title: 'Leave Updates',
            subtitle: 'Approval/rejection notifications',
            toggle: true,
            value: settings.notifications.leaveApprovals,
            onPress: () => handleToggleNotifications('leaveApprovals', !settings.notifications.leaveApprovals),
            color: '#F59E0B'
          })}
          {renderSettingItem({
            icon: 'log-out-outline',
            title: 'Sign Out',
            subtitle: 'Disconnect from AAI Portal',
            onPress: handleLogout,
            color: '#EF4444'
          })}
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.versionText}>Aviation Attendance Portal v1.2.0</Text>
          <View style={styles.footerLine} />
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value, isLast }) => (
  <View style={[styles.detailItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.detailIconBg}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Header Card
  headerCard: {
    padding: 14,
  },
  headerGradient: {
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  editAvatar: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#F59E0B',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  nameHeader: {
    marginLeft: 18,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  employeeId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontWeight: '600',
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statSep: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  // Section Header
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  // Card Common
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,51,102,0.04)',
  },
  // Detail Items
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    marginLeft: 14,
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  // Device Card
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  deviceModel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  deviceOs: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 14,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  settingSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    padding: 3,
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
