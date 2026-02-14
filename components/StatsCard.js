/**
 * AAI Attendance App - Stats Card Component
 * Shows statistics on dashboard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from './Card';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = Colors.primary,
  progress,
  progressColor = Colors.primary,
  onPress,
  style = {},
}) => {
  return (
    <Card onPress={onPress} style={[styles.card, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: iconColor + '30' }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

export const StatsGrid = ({ children, columns = 2, rows = 2 }) => {
  return (
    <View style={[styles.grid, { flexDirection: columns === 2 ? 'row' : 'column' }]}>
      {React.Children.map(children, (child, index) => (
        <View
          key={index}
          style={[
            styles.gridItem,
            columns === 2 && styles.gridItemHalf,
          ]}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    minWidth: 35,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginVertical: 8,
  },
  gridItem: {
    flex: 1,
    minWidth: 150,
  },
  gridItemHalf: {
    flex: 0.5,
  },
});

export default StatsCard;
