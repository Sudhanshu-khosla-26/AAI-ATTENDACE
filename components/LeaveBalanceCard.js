/**
 * AAI Attendance App - Leave Balance Card Component
 * Shows leave balance for a specific leave type
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from './Card';

const LeaveBalanceCard = ({
  type,
  name,
  total,
  used,
  remaining,
  color,
  icon,
  onPress,
  style = {},
}) => {
  const percentage = total > 0 ? (remaining / total) * 100 : 0;

  const getLeaveTypeIcon = () => {
    switch (type) {
      case 'CL':
        return 'beach';
      case 'SL':
        return 'medical';
      case 'EL':
        return 'calendar';
      default:
        return 'document';
    }
  };

  const getLeaveTypeColor = () => {
    switch (type) {
      case 'CL':
        return Colors.casualLeave;
      case 'SL':
        return Colors.sickLeave;
      case 'EL':
        return Colors.earnedLeave;
      default:
        return Colors.primary;
    }
  };

  const cardColor = color || getLeaveTypeColor();
  const cardIcon = icon || getLeaveTypeIcon();

  return (
    <Card onPress={onPress} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
          <Ionicons name={cardIcon} size={24} color={cardColor} />
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceValue}>{total}</Text>
          <Text style={styles.balanceLabel}>Total</Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceValue, { color: Colors.saffron }]}>{used}</Text>
          <Text style={styles.balanceLabel}>Used</Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={[styles.balanceValue, { color: Colors.success }]}>{remaining}</Text>
          <Text style={styles.balanceLabel}>Remaining</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: cardColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(percentage)}% remaining</Text>
      </View>
    </Card>
  );
};

export const LeaveBalanceGrid = ({ balances, onCardPress }) => {
  const leaveTypes = [
    { id: 'CL', name: 'Casual Leave' },
    { id: 'SL', name: 'Sick Leave' },
    { id: 'EL', name: 'Earned Leave' },
  ];

  return (
    <View style={styles.grid}>
      {leaveTypes.map((type) => {
        const balance = balances?.[type.id] || { total: 0, used: 0, remaining: 0 };
        return (
          <LeaveBalanceCard
            key={type.id}
            type={type.id}
            name={type.name}
            total={balance.total}
            used={balance.used}
            remaining={balance.remaining}
            onPress={() => onCardPress?.(type.id)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 10,
    minWidth: 80,
    textAlign: 'right',
  },
  grid: {
    marginVertical: 8,
  },
});

export default LeaveBalanceCard;
