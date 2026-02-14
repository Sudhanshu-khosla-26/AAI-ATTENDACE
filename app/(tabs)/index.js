/**
 * AAI Attendance App - Home Screen (Dashboard)
 * Main dashboard with attendance status and stats
 * FIXED VERSION - Improved mobile responsiveness
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useAuth, useAttendance } from '../../context';
import Header from '../../components/Header';
import AttendanceStatusCard from '../../components/AttendanceStatusCard';
import StatsCard, { StatsGrid } from '../../components/StatsCard';
import OfflineBanner from '../../components/OfflineBanner';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { useApp } from '../../context';
import { getSyncStatus } from "../../services/attendanceService";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const {
    attendanceStatus,
    attendanceStats,
    getAttendanceStatus,
    getAttendanceStats,
    loading,
  } = useAttendance();
  const { isOnline, syncStatus, syncAllData } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => {
    const loadSync = async () => {
      const status = await getSyncStatus();
      setPendingCount(status?.pendingCount ?? 0);
    };

    loadSync();
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getAttendanceStatus(),
      getAttendanceStats(),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCheckIn = () => {
    router.push({
      pathname: '/mark-attendance',
      params: { type: 'checkin' },
    });
  };

  const handleCheckOut = () => {
    router.push({
      pathname: '/mark-attendance',
      params: { type: 'checkout' },
    });
  };

  const handleSync = async () => {
    const result = await syncAllData();
    if (result.success) {
      setToast({
        visible: true,
        message: result.message,
        type: 'success',
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header
        title={getGreeting()}
        subtitle={user?.fullName || 'Employee'}
        rightIcon="notifications-outline"
        onRightPress={() => { }}
      />

      {/* Offline Banner */}
      <OfflineBanner
        isOffline={!isOnline}
        pendingCount={pendingCount}
        onSyncPress={handleSync}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Attendance Status Card */}
        <View style={styles.cardContainer}>
          <AttendanceStatusCard
            status={attendanceStatus}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            loading={loading}
          />
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>This Month</Text>

        <StatsGrid columns={2}>
          <StatsCard
            title="Attendance"
            value={`${attendanceStats.attendancePercentage || 0}%`}
            subtitle={`${attendanceStats.presentDays || 0} of ${attendanceStats.totalDays || 0} days`}
            icon="calendar-check"
            iconColor={Colors.success}
            progress={attendanceStats.attendancePercentage || 0}
            progressColor={Colors.success}
          />
          <StatsCard
            title="Total Hours"
            value={`${attendanceStats.totalHours || 0}h`}
            subtitle={`Avg: ${attendanceStats.averageHours || 0}h/day`}
            icon="time"
            iconColor={Colors.primary}
          />
          <StatsCard
            title="Leaves Taken"
            value={`${attendanceStats.leaveDays || 0}`}
            subtitle="Days this month"
            icon="document-text"
            iconColor={Colors.warning}
          />
          <StatsCard
            title="Absent"
            value={`${attendanceStats.absentDays || 0}`}
            subtitle="Days this month"
            icon="close-circle"
            iconColor={Colors.error}
          />
        </StatsGrid>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActions}>
          <QuickActionButton
            icon="calendar"
            label="Apply Leave"
            onPress={() => router.push('/apply-leave')}
            color={Colors.info}
          />
          <QuickActionButton
            icon="time"
            label="View History"
            onPress={() => router.push('/history')}
            color={Colors.primary}
          />
          <QuickActionButton
            icon="sync"
            label="Sync Data"
            onPress={handleSync}
            color={Colors.success}
          />
          <QuickActionButton
            icon="help-circle"
            label="Help"
            onPress={() => { }}
            color={Colors.saffron}
          />
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Loading Overlay */}
      <Loading visible={loading && !refreshing} overlay />
    </SafeAreaView>
  );
}

const QuickActionButton = ({ icon, label, onPress, color }) => (
  <TouchableOpacity
    style={styles.quickActionContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.quickActionLabel} numberOfLines={2}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  quickActionContainer: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});