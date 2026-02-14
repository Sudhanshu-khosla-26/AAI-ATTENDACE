/**
 * AAI Attendance App - History Screen
 * Attendance history with calendar view
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/colors';
import { useAttendance } from '../../context';
import Header from '../../components/Header';
import Calendar from '../../components/Calendar';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatTime } from '../../utils/dateUtils';

export default function HistoryScreen() {
  const { attendanceHistory, attendanceStats, getAttendanceHistory, getAttendanceStats, loading } = useAttendance();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    await Promise.all([
      getAttendanceHistory(monthKey),
      getAttendanceStats(monthKey),
    ]);
    
    // Convert attendance history to calendar format
    const data = {};
    attendanceHistory.forEach(record => {
      const day = parseInt(record.date.split('-')[2]);
      data[day] = {
        status: record.status,
        checkIn: record.checkIn?.time,
        checkOut: record.checkOut?.time,
        totalHours: record.totalHours,
      };
    });
    setCalendarData(data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return Colors.success;
      case 'absent': return Colors.error;
      case 'halfDay': return Colors.warning;
      case 'leave': return Colors.leave;
      default: return Colors.textLight;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'halfDay': return 'Half Day';
      case 'leave': return 'Leave';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header title="Attendance History" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <SummaryItem label="Total Days" value={attendanceStats.totalDays || 0} />
            <SummaryItem label="Present" value={attendanceStats.presentDays || 0} color={Colors.success} />
            <SummaryItem label="Absent" value={attendanceStats.absentDays || 0} color={Colors.error} />
            <SummaryItem label="Leave" value={attendanceStats.leaveDays || 0} color={Colors.leave} />
          </View>
        </Card>

        {/* Calendar */}
        <Calendar
          year={selectedMonth.getFullYear()}
          month={selectedMonth.getMonth()}
          attendanceData={calendarData}
        />

        {/* Recent Records */}
        <Text style={styles.sectionTitle}>Recent Records</Text>
        
        {attendanceHistory.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Records"
            message="No attendance records found for this month"
          />
        ) : (
          attendanceHistory.slice(0, 10).map((record) => (
            <Card key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {formatDate(record.date, 'dd MMM yyyy')}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                    {getStatusLabel(record.status)}
                  </Text>
                </View>
              </View>
              
              {record.checkIn && (
                <View style={styles.recordTimes}>
                  <View style={styles.timeItem}>
                    <Ionicons name="arrow-forward-circle" size={16} color={Colors.success} />
                    <Text style={styles.timeText}>
                      In: {formatTime(record.checkIn.time)}
                    </Text>
                  </View>
                  {record.checkOut && (
                    <View style={styles.timeItem}>
                      <Ionicons name="arrow-back-circle" size={16} color={Colors.saffron} />
                      <Text style={styles.timeText}>
                        Out: {formatTime(record.checkOut.time)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {record.totalHours > 0 && (
                <View style={styles.hoursContainer}>
                  <Ionicons name="time-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.hoursText}>
                    Total: {record.totalHours} hours
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Loading visible={loading && !refreshing} overlay />
    </SafeAreaView>
  );
}

const SummaryItem = ({ label, value, color = Colors.text }) => (
  <View style={styles.summaryItem}>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  recordCard: {
    marginBottom: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordTimes: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
  },
});
