/**
 * AAI Attendance App - Leaves Screen
 * Redesigned: Modern Blue, Compact, iPhone 12 optimized.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/colors';
import { useLeave, useAuth } from '../../context';
import Header from '../../components/Header';
import LeaveBalanceCard, { LeaveBalanceGrid } from '../../components/LeaveBalanceCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function LeavesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    leaveBalances,
    leaveHistory,
    getLeaveBalances,
    getLeaveHistory,
    loading,
    getLeaveTypeColor,
    getLeaveTypeName,
  } = useLeave();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected

  const loadData = useCallback(async () => {
    await Promise.all([
      getLeaveBalances(),
      getLeaveHistory(),
    ]);
  }, [getLeaveBalances, getLeaveHistory]);

  // Handle focus behavior
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved': return { color: '#10B981', icon: 'checkmark-circle' };
      case 'pending': return { color: '#F59E0B', icon: 'time' };
      case 'rejected': return { color: '#EF4444', icon: 'close-circle' };
      case 'cancelled': return { color: '#94A3B8', icon: 'ban' };
      default: return { color: '#94A3B8', icon: 'help-circle' };
    }
  };

  const renderLeaveItem = (item) => {
    const config = getStatusConfig(item.status);
    return (
      <View key={item.id} style={styles.leaveCard}>
        <View style={styles.leaveCardBody}>
          <View style={styles.leaveTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: getLeaveTypeColor(item.leaveType) + '12', borderColor: getLeaveTypeColor(item.leaveType) + '30' }]}>
              <Text style={[styles.typeText, { color: getLeaveTypeColor(item.leaveType) }]}>
                {getLeaveTypeName(item.leaveType)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.color + '10' }]}>
              <Ionicons name={config.icon} size={12} color={config.color} />
              <Text style={[styles.statusText, { color: config.color }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.leaveMain}>
            <View style={styles.dateBlock}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>FROM</Text>
                <Text style={styles.dateValue}>{formatDate(item.startDate, 'dd MMM')}</Text>
              </View>
              <View style={styles.dateSep}>
                <View style={styles.sepLine} />
                <View style={styles.daysBubble}>
                  <Text style={styles.daysText}>{item.numberOfDays}D</Text>
                </View>
                <View style={styles.sepLine} />
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>TO</Text>
                <Text style={styles.dateValue}>{formatDate(item.endDate, 'dd MMM')}</Text>
              </View>
            </View>

            <Text style={styles.reasonText} numberOfLines={2}>
              {item.reason}
            </Text>
          </View>

          <View style={styles.leaveFooter}>
            <Text style={styles.appliedDate}>Applied on {formatDate(item.appliedAt, 'dd MMM yyyy')}</Text>
            <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
          </View>
        </View>
      </View>
    );
  };

  const currentLeaves = leaveHistory[activeTab] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header title="Leave Management" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Balances Section with Gradient Background */}
        <View style={styles.balancesSection}>
          <LinearGradient
            colors={['#003366', '#004B99']}
            style={styles.balancesBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balancesHeader}>
              <Text style={styles.balancesTitle}>My Entitlements</Text>
              <TouchableOpacity onPress={() => router.push('/apply-leave')} style={styles.applyBtn}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            <LeaveBalanceGrid balances={leaveBalances} />
          </LinearGradient>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            {['pending', 'approved', 'rejected'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {leaveHistory[tab]?.length > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab && styles.activeTabBadge]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab && styles.activeTabBadgeText]}>
                      {leaveHistory[tab].length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeTab.toUpperCase()} REQUESTS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.listContainer}>
          {currentLeaves.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title={`No ${activeTab} leaves`}
              message={`Your ${activeTab} requests will appear here`}
            />
          ) : (
            currentLeaves.map(renderLeaveItem)
          )}
        </View>
      </ScrollView>

      <Loading visible={loading && !refreshing} overlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Balances
  balancesSection: {
    padding: 14,
  },
  balancesBg: {
    borderRadius: 22,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  balancesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balancesTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,153,51,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  // Tabs
  tabsWrapper: {
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary + '10',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  activeTabBadge: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '800',
  },
  activeTabBadgeText: {
    color: '#FFF',
  },
  // History Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,51,102,0.08)',
  },
  listContainer: {
    paddingHorizontal: 14,
  },
  leaveCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,51,102,0.04)',
    overflow: 'hidden',
  },
  leaveCardBody: {
    padding: 14,
  },
  leaveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leaveMain: {
    marginBottom: 14,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 2,
  },
  dateSep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sepLine: {
    width: 15,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  daysBubble: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  daysText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  leaveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  appliedDate: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
