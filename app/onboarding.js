/**
 * AAI Attendance App - Onboarding Screen
 * Swipeable onboarding slides
 * Redesigned: Modern Blue, Premium, iPhone 12 optimized.
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInRight, FadeInUp } from 'react-native-reanimated';

import Colors from '../constants/colors';
import { STORAGE_KEYS } from '../constants/config';
import { storeData } from '../utils/storageUtils';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Precision GPS Tracking',
    description: 'Aviation-grade location verification. Only mark attendance when you are securely within your designated airport workstation geofence.',
    icon: 'navigate-circle',
    color: '#FF9933', // AAI Saffron
  },
  {
    id: '2',
    title: 'Biometric Security',
    description: 'Military-grade encryption for your personnel data. Log in seamlessly using your device\'s native fingerprint or facial recognition.',
    icon: 'shield-checkmark',
    color: '#0055AA', // AAI Blue
  },
  {
    id: '3',
    title: 'Face Verification',
    description: 'Ensure authenticity with AI-powered photo captures during shift start and end. Say goodbye to manual records and proxy attendance.',
    icon: 'camera',
    color: '#10B981', // Success Green
  },
  {
    id: '4',
    title: 'Seamless Connectivity',
    description: 'Designed for mission-critical operations. Works offline and syncs data automatically once the network is restored.',
    icon: 'swap-horizontal',
    color: '#F59E0B', // Warning Amber
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await storeData(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      router.replace('/login');
    } catch (error) {
      console.error('Onboarding Error:', error);
      router.replace('/login');
    }
  };

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    setCurrentIndex(Math.round(x / width));
  };

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <Animated.View
          entering={FadeIn.delay(200)}
          style={styles.iconBackdrop}
        >
          <LinearGradient
            colors={[item.color + '40', item.color + '10']}
            style={styles.iconCircle}
          >
            <Ionicons name={item.icon} size={84} color="#FFF" />
          </LinearGradient>
        </Animated.View>

        <View style={styles.textContent}>
          <Animated.Text entering={FadeInUp.delay(300)} style={styles.title}>{item.title}</Animated.Text>
          <Animated.Text entering={FadeInUp.delay(400)} style={styles.description}>{item.description}</Animated.Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#003366', '#001A33']}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipT}>SKIP</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={slides}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
          />

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {slides.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
              ))}
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={handleNext} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF9933', '#E67E00']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.btnText}>
                  {currentIndex === slides.length - 1 ? 'GET STARTED' : 'CONTINUE'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  skipBtn: { padding: 10 },
  skipT: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconBackdrop: { marginBottom: 60 },
  iconCircle: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  textContent: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: -0.5 },
  description: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 16, lineHeight: 24, fontWeight: '500' },

  footer: { paddingHorizontal: 30, paddingBottom: 40 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 24, backgroundColor: '#FF9933' },

  mainBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#FF9933', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
