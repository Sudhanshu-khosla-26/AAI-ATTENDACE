/**
 * AAI Attendance App - Offline Banner Component
 * Shows when device is offline
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const OfflineBanner = ({
  isOffline,
  pendingCount = 0,
  onSyncPress,
  style = {},
}) => {
  if (!isOffline && pendingCount === 0) return null;

  return (
    <View style={[
      styles.container,
      isOffline ? styles.offline : styles.pending,
      style,
    ]}>
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? 'cloud-offline' : 'sync'}
          size={20}
          color={isOffline ? Colors.error : Colors.warning}
        />
        <View style={styles.textContainer}>
          <Text style={styles.message}>
            {isOffline
              ? 'Working Offline - Data will sync when connected'
              : `${pendingCount} item(s) pending sync`}
          </Text>
        </View>
        {onSyncPress && !isOffline && (
          <TouchableOpacity onPress={onSyncPress} style={styles.syncButton}>
            <Text style={styles.syncText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offline: {
    backgroundColor: Colors.errorLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.error,
  },
  pending: {
    backgroundColor: Colors.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  message: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
    color: Colors.textWhite,
    fontWeight: '600',
  },
});

export default OfflineBanner;
