/**
 * AAI Attendance App - History Screen
 * Redesigned: Modern Blue, Compact, iPhone 12 optimized.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useAttendance } from '../../context';
import Header from '../../components/Header';
import Calendar from '../../components/Calendar';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatTime } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const { attendanceHistory, attendanceStats, getAttendanceHistory, getAttendanceStats, loading } = useAttendance();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  const loadData = useCallback(async () => {
    const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    await Promise.all([
      getAttendanceHistory(monthKey),
      getAttendanceStats(monthKey),
    ]);
  }, [selectedMonth, getAttendanceHistory, getAttendanceStats]);

  // Handle focus behavior
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    // Re-process calendar data when history changes
    const data = {};
    attendanceHistory.forEach(record => {
      const day = parseInt(record.date.split('-')[2]);
      if (day) {
        data[day] = {
          status: record.status,
          checkIn: record.checkIn?.time,
          checkOut: record.checkOut?.time,
          totalHours: record.totalHours,
        };
      }
    });
    setCalendarData(data);
  }, [attendanceHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const getStatusConfig = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT': return { color: '#10B981', label: 'Present', icon: 'checkmark-circle' };
      case 'ABSENT': return { color: '#EF4444', label: 'Absent', icon: 'close-circle' };
      case 'HALF_DAY':
      case 'HALFDAY': return { color: '#F59E0B', label: 'Half Day', icon: 'time' };
      case 'LEAVE': return { color: '#3B82F6', label: 'Leave', icon: 'document-text' };
      default: return { color: '#9CA3AF', label: 'Unknown', icon: 'help-circle' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />

      <Header title="Attendance History" />

      {/* Month Selector — Modern Blue Style */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.monthBtn}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.monthLabelBox}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.monthText}>
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.monthBtn}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Stats Row — More Compact */}
        <View style={styles.statsRow}>
          <SummaryBox label="Total" value={attendanceStats.totalDays || 0} color="#6B7280" />
          <SummaryBox label="Present" value={attendanceStats.presentDays || 0} color="#10B981" />
          <SummaryBox label="Absent" value={attendanceStats.absentDays || 0} color="#EF4444" />
          <SummaryBox label="Leave" value={attendanceStats.leaveDays || 0} color="#3B82F6" />
        </View>

        {/* Calendar Card */}
        <View style={styles.cardContainer}>
          <Calendar
            year={selectedMonth.getFullYear()}
            month={selectedMonth.getMonth()}
            attendanceData={calendarData}
          />
        </View>

        {/* List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Logs</Text>
          <View style={styles.sectionLine} />
        </View>

        {attendanceHistory.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Records"
            message="No attendance logs for this month"
          />
        ) : (
          [...attendanceHistory].reverse().map((record) => {
            const config = getStatusConfig(record.status);
            return (
              <View key={record.id} style={styles.recordCard}>
                <View style={[styles.statusVerticalBar, { backgroundColor: config.color }]} />
                <View style={styles.recordBody}>
                  <View style={styles.recordMain}>
                    <View>
                      <Text style={styles.recordDay}>{formatDate(record.date, 'EEEE')}</Text>
                      <Text style={styles.recordDate}>{formatDate(record.date, 'dd MMM yyyy')}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.color + '12', borderColor: config.color + '30' }]}>
                      <Ionicons name={config.icon} size={12} color={config.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>

                  {record.status !== 'absent' && record.checkIn && (
                    <View style={styles.recordDetails}>
                      <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>CHECK IN</Text>
                        <Text style={styles.timeValue}>{formatTime(record.checkIn.time)}</Text>
                      </View>
                      <View style={styles.timeDivider} />
                      <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>CHECK OUT</Text>
                        <Text style={styles.timeValue}>{record.checkOut ? formatTime(record.checkOut.time) : '--:--'}</Text>
                      </View>
                      <View style={styles.timeDivider} />
                      <View style={styles.timeBox}>
                        <Text style={styles.timeLabel}>TOTAL</Text>
                        <Text style={styles.timeValue}>{record.totalHours || '0'}h</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Loading visible={loading && !refreshing} overlay />
    </SafeAreaView>
  );
}

const SummaryBox = ({ label, value, color }) => (
  <View style={styles.summaryBox}>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 32,
  },
  // Month selector
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 8,
    padding: 8,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,51,102,0.08)',
  },
  // Record card
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusVerticalBar: {
    width: 4,
  },
  recordBody: {
    flex: 1,
    padding: 12,
  },
  recordMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordDay: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  recordDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeBox: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  timeDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
});
