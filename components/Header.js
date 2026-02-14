/**
 * AAI Attendance App - Header Component
 * App header with AAI branding
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const Header = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  leftIcon,
  onLeftPress,
  transparent = false,
  style = {},
}) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        transparent && styles.transparentContainer,
        style,
      ]}
      edges={['top']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={transparent ? 'transparent' : Colors.primary}
      />
      <View style={[styles.header, transparent && styles.transparentHeader]}>
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          ) : leftIcon ? (
            <TouchableOpacity
              onPress={onLeftPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={leftIcon} size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={rightIcon} size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  transparentHeader: {
    backgroundColor: 'rgba(10, 36, 99, 0.8)',
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textWhite,
    opacity: 0.8,
    marginTop: 2,
  },
  iconButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
});

export default Header;
