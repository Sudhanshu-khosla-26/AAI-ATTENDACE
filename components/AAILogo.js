/**
 * AAI Attendance App - AAI Logo Component
 * Airport Authority of India logo and branding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const AAILogo = ({
  size = 'medium', // small, medium, large
  showText = true,
  showSubtitle = false,
  style = {},
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 60,
          icon: 30,
          title: 16,
          subtitle: 10,
        };
      case 'large':
        return {
          container: 120,
          icon: 60,
          title: 28,
          subtitle: 16,
        };
      default:
        return {
          container: 80,
          icon: 40,
          title: 22,
          subtitle: 12,
        };
    }
  };

  const sizes = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      {/* Logo Circle with Tricolor */}
      <View
        style={[
          styles.logoContainer,
          {
            width: sizes.container,
            height: sizes.container,
            borderRadius: sizes.container / 2,
          },
        ]}
      >
        {/* Saffron Top */}
        <View style={[styles.tricolorStrip, { backgroundColor: Colors.saffron, flex: 1 }]} />
        {/* White Middle */}
        <View style={[styles.tricolorStrip, { backgroundColor: Colors.background, flex: 1 }]}>
          <Ionicons
            name="airplane"
            size={sizes.icon}
            color={Colors.primary}
            style={styles.planeIcon}
          />
        </View>
        {/* Green Bottom */}
        <View style={[styles.tricolorStrip, { backgroundColor: Colors.green, flex: 1 }]} />
      </View>

      {/* Text */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: sizes.title }]}>
            Airport Authority
          </Text>
          <Text style={[styles.title, { fontSize: sizes.title }]}>
            of India
          </Text>
          {showSubtitle && (
            <Text style={[styles.subtitle, { fontSize: sizes.subtitle }]}>
              Secure Attendance System
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tricolorStrip: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planeIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AAILogo;
