/**
 * AAI Attendance App - Home Screen
 * Compact, modern, blue-shaded. iPhone 12 optimised.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useAuth, useAttendance, useApp } from '../../context';
import Header from '../../components/Header';
import AttendanceStatusCard from '../../components/AttendanceStatusCard';
import OfflineBanner from '../../components/OfflineBanner';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { getSyncStatus } from '../../services/attendanceService';

const { width } = Dimensions.get('window');
const TILE_W = (width - 14 * 2 - 10) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);

  const { attendanceStatus, attendanceStats, getAttendanceStatus, getAttendanceStats, loading } = useAttendance();
  const { isOnline, syncAllData } = useApp();

  const loadData = useCallback(async () => {
    await Promise.all([getAttendanceStatus(), getAttendanceStats()]);
  }, [getAttendanceStatus, getAttendanceStats]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  useEffect(() => {
    getSyncStatus().then(s => setPendingCount(s?.pendingCount ?? 0));
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSync = async () => {
    const r = await syncAllData();
    setToast({ visible: true, message: r.message || 'Sync complete', type: r.success ? 'success' : 'error' });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    { icon: 'calendar', label: 'Attendance', value: `${attendanceStats.attendancePercentage || 0}%`, sub: `${attendanceStats.presentDays || 0}/${attendanceStats.totalDays || 0} days`, color: Colors.primary, progress: attendanceStats.attendancePercentage || 0 },
    { icon: 'time', label: 'Hours', value: `${attendanceStats.totalHours || 0}h`, sub: `Avg ${attendanceStats.averageHours || 0}h/day`, color: '#0077CC' },
    { icon: 'document-text', label: 'Leaves', value: `${attendanceStats.leaveDays || 0}`, sub: 'Days taken', color: '#FF9933' },
    { icon: 'close-circle', label: 'Absent', value: `${attendanceStats.absentDays || 0}`, sub: 'Days this month', color: '#EF4444' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header
        title={greeting()}
        subtitle={user?.fullName || 'Employee'}
        rightIcon="notifications-outline"
        onRightPress={() => { }}
      />

      <OfflineBanner isOffline={!isOnline} pendingCount={pendingCount} onSyncPress={handleSync} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* ── Attendance card ── */}
        <AttendanceStatusCard
          status={attendanceStatus}
          onCheckIn={() => router.push({ pathname: '/mark-attendance', params: { type: 'checkin' } })}
          onCheckOut={() => router.push({ pathname: '/mark-attendance', params: { type: 'checkout' } })}
          loading={loading}
        />

        {/* ── This Month ── */}
        <SectionLabel label="This Month" />
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <StatTile key={i} {...s} />
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <SectionLabel label="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionBtn icon="calendar-outline" label="Apply Leave" color="#0055AA" onPress={() => router.push('/apply-leave')} />
          <ActionBtn icon="time-outline" label="History" color="#006FD6" onPress={() => router.push('/history')} />
          <ActionBtn icon="sync-outline" label="Sync" color="#138808" onPress={handleSync} />
          <ActionBtn icon="help-circle-outline" label="Help" color="#FF9933" onPress={() => { }} />
        </View>

        {/* ── AAI Footer ── */}
        <View style={styles.footer}>
          <Ionicons name="airplane-outline" size={10} color={Colors.textLight} />
          <Text style={styles.footerText}>Airports Authority of India</Text>
        </View>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      <Loading visible={loading && !refreshing} overlay />
    </SafeAreaView>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

const SectionLabel = ({ label }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const StatTile = ({ icon, label, value, sub, color, progress }) => (
  <View style={[styles.tile, { width: TILE_W }]}>
    {/* Progress fill accent */}
    {progress !== undefined && (
      <View style={[styles.tileAccentBar, { backgroundColor: color + '15' }]}>
        <View style={[styles.tileAccentFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
      </View>
    )}
    <View style={styles.tileTop}>
      <View style={[styles.tileIconBg, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
    </View>
    <Text style={styles.tileValue}>{value}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileSub} numberOfLines={1}>{sub}</Text>
  </View>
);

const ActionBtn = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

/* ── Styles ─────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFF3FA' },
  scroll: { paddingBottom: 28 },

  // Section header
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 18, marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: Colors.primary, letterSpacing: 0.2 },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,51,102,0.09)', borderRadius: 1 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 14 },

  // Stat tiles — compact white cards
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,51,102,0.05)',
  },
  tileAccentBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
  tileAccentFill: { height: '100%', borderRadius: 2 },
  tileTop: { marginBottom: 8 },
  tileIconBg: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileValue: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.5 },
  tileLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginTop: 1 },
  tileSub: { fontSize: 9, color: Colors.textLight, marginTop: 2, fontWeight: '500' },

  // Quick actions
  actionsRow: { flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'space-between' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 2 },
  actionIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  actionLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 18, opacity: 0.4 },
  footerText: { fontSize: 10, color: Colors.textLight, fontWeight: '500', letterSpacing: 0.5 },
});