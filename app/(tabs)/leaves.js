/**
 * AAI Attendance App - Leaves Screen
 * Leave management and application
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useLeave, useAuth } from '../../context';
import Header from '../../components/Header';
import LeaveBalanceCard, { LeaveBalanceGrid } from '../../components/LeaveBalanceCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/dateUtils';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getLeaveBalances(),
      getLeaveHistory(),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return Colors.success;
      case 'pending': return Colors.warning;
      case 'rejected': return Colors.error;
      case 'cancelled': return Colors.textLight;
      default: return Colors.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'ban';
      default: return 'help-circle';
    }
  };

  const renderLeaveItem = (item) => (
    <Card key={item.id} style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <View style={[styles.leaveTypeBadge, { backgroundColor: getLeaveTypeColor(item.leaveType) + '20' }]}>
          <Text style={[styles.leaveTypeText, { color: getLeaveTypeColor(item.leaveType) }]}>
            {getLeaveTypeName(item.leaveType)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.leaveDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={Colors.textLight} />
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
        </View>
        <View style={styles.daysBadge}>
          <Text style={styles.daysText}>{item.numberOfDays} days</Text>
        </View>
      </View>

      <Text style={styles.reasonText} numberOfLines={2}>
        {item.reason}
      </Text>

      <Text style={styles.appliedText}>
        Applied on {formatDate(item.appliedAt, 'dd MMM yyyy')}
      </Text>
    </Card>
  );

  const currentLeaves = leaveHistory[activeTab] || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header title="Leave Management" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Leave Balances */}
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <LeaveBalanceGrid balances={leaveBalances} />

        {/* Apply Leave Button */}
        <Button
          title="Apply for Leave"
          onPress={() => router.push('/apply-leave')}
          icon="add"
          fullWidth
          style={styles.applyButton}
        />

        {/* Tabs */}
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
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{leaveHistory[tab].length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave List */}
        {currentLeaves.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title={`No ${activeTab} leaves`}
            message={`You don't have any ${activeTab} leave applications`}
          />
        ) : (
          currentLeaves.map(renderLeaveItem)
        )}
      </ScrollView>

      <Loading visible={loading && !refreshing} overlay />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  applyButton: {
    marginVertical: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    color: Colors.textWhite,
    fontWeight: '600',
    paddingHorizontal: 5,
  },
  leaveCard: {
    marginBottom: 12,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leaveTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  leaveDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 2,
  },
  daysBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  appliedText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
