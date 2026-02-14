/**
 * AAI Attendance App - Attendance Status Card Component
 * Shows today's attendance status on dashboard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from './Card';
import Button from './Button';
import { formatDate, formatTime } from '../utils/dateUtils';

const AttendanceStatusCard = ({
  status,
  onCheckIn,
  onCheckOut,
  loading = false,
}) => {
  const { hasCheckedIn, hasCheckedOut, checkInTime, checkOutTime, totalHours } = status || {};

  const getStatusConfig = () => {
    if (!hasCheckedIn) {
      return {
        icon: 'time',
        iconColor: Colors.warning,
        title: 'Not Checked In',
        subtitle: 'Mark your attendance to start the day',
        buttonVariant: 'success',
        buttonTitle: 'Mark Check-In',
        buttonIcon: 'log-in',
        buttonAction: onCheckIn,
        isComplete: false,
      };
    }

    if (hasCheckedIn && !hasCheckedOut) {
      return {
        icon: 'sunny',
        iconColor: Colors.success,
        title: 'Checked In',
        subtitle: `Since ${formatTime(checkInTime)}`,
        buttonVariant: 'secondary',
        buttonTitle: 'Mark Check-Out',
        buttonIcon: 'log-out',
        buttonAction: onCheckOut,
        isComplete: false,
      };
    }

    return {
      icon: 'checkmark-circle',
      iconColor: Colors.success,
      title: 'Attendance Complete',
      subtitle: `Total hours: ${totalHours}h`,
      buttonVariant: 'primary',
      buttonTitle: 'Completed',
      buttonIcon: 'checkmark',
      buttonAction: null,
      isComplete: true,
    };
  };

  const config = getStatusConfig();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.date}>{formatDate(new Date(), 'EEEE, dd MMM yyyy')}</Text>
        </View>
        <View style={[styles.statusIcon, { backgroundColor: config.iconColor + '20' }]}>
          <Ionicons name={config.icon} size={28} color={config.iconColor} />
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>{config.title}</Text>
        <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
      </View>

      {hasCheckedIn && (
        <View style={styles.timesContainer}>
          <View style={styles.timeItem}>
            <Ionicons name="arrow-forward-circle" size={20} color={Colors.success} />
            <View style={styles.timeTextContainer}>
              <Text style={styles.timeLabel}>Check In</Text>
              <Text style={styles.timeValue}>
                {checkInTime ? formatTime(checkInTime) : '--:--'}
              </Text>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeItem}>
            <Ionicons name="arrow-back-circle" size={20} color={hasCheckedOut ? Colors.saffron : Colors.textLight} />
            <View style={styles.timeTextContainer}>
              <Text style={styles.timeLabel}>Check Out</Text>
              <Text style={styles.timeValue}>
                {checkOutTime ? formatTime(checkOutTime) : '--:--'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Button
        title={config.buttonTitle}
        onPress={config.buttonAction}
        variant={config.buttonVariant}
        icon={config.buttonIcon}
        loading={loading}
        disabled={config.isComplete || loading}
        fullWidth
        style={styles.actionButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTextContainer: {
    marginLeft: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  actionButton: {
    marginTop: 4,
  },
});

export default AttendanceStatusCard;
