/**
 * AAI Attendance App - Splash Screen
 * Entry point with AAI branding and animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import { APP_INFO } from '../constants/config';
import { getData } from '../utils/storageUtils';
import { STORAGE_KEYS } from '../constants/config';
import { useAuth } from '../context';

export default function SplashScreen() {
  const router = useRouter();
  const { initializing, isAuthenticated, isDeviceRegistered } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [isReady, setIsReady] = useState(false);

  // Animation sequence
  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Minimum splash screen duration (2.5 seconds)
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Navigation logic
  useEffect(() => {
    if (isReady && !initializing) {
      navigateToNextScreen();
    }
  }, [isReady, initializing, isAuthenticated, isDeviceRegistered]);

  const navigateToNextScreen = async () => {
    try {
      // Check if onboarding is completed
      const onboardingCompleted = await getData(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
      
      if (!onboardingCompleted) {
        // First time user - go to onboarding
        router.replace('/onboarding');
        return;
      }

      if (!isAuthenticated) {
        // Not authenticated - go to login
        router.replace('/login');
        return;
      }

      if (!isDeviceRegistered) {
        // Device not registered - go to device registration
        router.replace('/device-registration');
        return;
      }

      // All checks passed - go to home
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* AAI Logo with Tricolor */}
          <View style={styles.logo}>
            {/* Saffron Strip */}
            <View style={[styles.logoStrip, styles.saffronStrip]} />
            {/* White Strip with Plane */}
            <View style={[styles.logoStrip, styles.whiteStrip]}>
              <Ionicons
                name="airplane"
                size={50}
                color={Colors.primary}
                style={styles.planeIcon}
              />
            </View>
            {/* Green Strip */}
            <View style={[styles.logoStrip, styles.greenStrip]} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.title}>Airport Authority</Text>
          <Text style={styles.title}>of India</Text>
          <Text style={styles.subtitle}>{APP_INFO.fullName}</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{APP_INFO.governmentNotice}</Text>
        <Text style={styles.versionText}>Version {APP_INFO.version}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.primary,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoStrip: {
    flex: 1,
    width: '100%',
  },
  saffronStrip: {
    backgroundColor: Colors.saffron,
  },
  whiteStrip: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenStrip: {
    backgroundColor: Colors.green,
  },
  planeIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 48,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textLight,
    opacity: 0.7,
  },
});
