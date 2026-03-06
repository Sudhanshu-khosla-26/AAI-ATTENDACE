/**
 * AAI Attendance App - Calendar Component
 * Monthly calendar view for attendance history
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { getCalendarDays, formatDate } from '../utils/dateUtils';

const Calendar = ({
  year,
  month,
  attendanceData = {},
  onDatePress,
  style = {},
}) => {
  const days = getCalendarDays(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayStatus = (day) => {
    const dayData = attendanceData[day.getDate()];
    if (!dayData) return null;
    return dayData.status;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
        return Colors.present;
      case 'ABSENT':
        return Colors.absent;
      case 'HALF_DAY':
      case 'HALFDAY':
        return Colors.halfDay;
      case 'LEAVE':
        return Colors.leave;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
        return 'checkmark';
      case 'ABSENT':
        return 'close';
      case 'HALF_DAY':
      case 'HALFDAY':
        return 'remove';
      case 'LEAVE':
        return 'calendar';
      default:
        return null;
    }
  };

  // Calculate empty cells at the start
  const firstDayOfMonth = days[0];
  const emptyCells = firstDayOfMonth.getDay();

  return (
    <View style={[styles.container, style]}>
      {/* Week day headers */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.daysContainer}>
        {/* Empty cells */}
        {Array.from({ length: emptyCells }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCell} />
        ))}

        {/* Days */}
        {days.map((day) => {
          const status = getDayStatus(day);
          const statusColor = getStatusColor(status);
          const statusIcon = getStatusIcon(status);
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayCell,
                statusColor && { backgroundColor: statusColor + '20' },
                isToday && styles.todayCell,
              ]}
              onPress={() => onDatePress?.(day, attendanceData[day.getDate()])}
              disabled={!status}
            >
              <Text
                style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  statusColor && { color: statusColor },
                ]}
              >
                {day.getDate()}
              </Text>
              {statusIcon && (
                <Ionicons
                  name={statusIcon}
                  size={12}
                  color={statusColor}
                  style={styles.statusIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <LegendItem color={Colors.present} label="Present" />
        <LegendItem color={Colors.absent} label="Absent" />
        <LegendItem color={Colors.halfDay} label="Half Day" />
        <LegendItem color={Colors.leave} label="Leave" />
      </View>
    </View>
  );
};

const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  todayText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  statusIcon: {
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default Calendar;
