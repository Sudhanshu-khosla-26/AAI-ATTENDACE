/**
 * AAI Attendance App - Header Component
 * Compact, navy blue, modern. iPhone 12 optimised.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
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
      style={[styles.safe, transparent && styles.transparentSafe, style]}
      edges={['top']}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        {/* Left */}
        <View style={styles.side}>
          {showBack ? (
            <TouchableOpacity onPress={onBackPress} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          ) : leftIcon ? (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name={leftIcon} size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            /* Tiny AAI logo mark */
            <View style={styles.logoBox}>
              <Ionicons name="airplane" size={13} color="#FF9933" />
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {/* Right */}
        <View style={styles.side}>
          {rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <View style={styles.iconPill}>
                <Ionicons name={rightIcon} size={19} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.primary,
  },
  transparentSafe: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 52,
  },
  side: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
    fontWeight: '500',
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,153,51,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,153,51,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    padding: 2,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
