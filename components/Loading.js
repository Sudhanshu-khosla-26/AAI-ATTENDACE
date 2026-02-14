/**
 * AAI Attendance App - Loading Component
 * Loading spinner with AAI branding
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import Colors from '../constants/colors';

const Loading = ({
  visible = false,
  message = 'Loading...',
  overlay = false,
  size = 'large',
  color = Colors.primary,
  fullScreen = false,
}) => {
  if (!visible) return null;

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default Loading;
