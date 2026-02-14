/**
 * AAI Attendance App - Onboarding Screen
 * Swipeable onboarding slides
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import Colors from '../constants/colors';
import { STORAGE_KEYS } from '../constants/config';
import { storeData } from '../utils/storageUtils';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Secure Biometric Access',
    description: 'Your device is your key. Access your attendance records securely using fingerprint or Face ID authentication.',
    icon: 'finger-print',
    color: Colors.primary,
  },
  {
    id: '2',
    title: 'Geofence Attendance',
    description: 'GPS-based location verification ensures you can only mark attendance when you are at your designated workplace.',
    icon: 'location',
    color: Colors.success,
  },
  {
    id: '3',
    title: 'Face Verification',
    description: 'Dual photo capture for check-in and check-out prevents proxy attendance and ensures authenticity.',
    icon: 'camera',
    color: Colors.saffron,
  },
  {
    id: '4',
    title: 'Offline Capable',
    description: 'Mark attendance even without internet. All data syncs automatically when you are back online.',
    icon: 'cloud-offline',
    color: Colors.info,
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
      console.error('Error completing onboarding:', error);
      router.replace('/login');
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <Animated.View
          entering={FadeIn.delay(index * 100)}
          style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}
        >
          <Ionicons name={item.icon} size={80} color={item.color} />
        </Animated.View>
        
        <Animated.View entering={FadeInRight.delay(index * 150)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {renderDots()}
        
        <View style={styles.buttonContainer}>
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            icon={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            iconPosition="right"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  slide: {
    width,
    paddingHorizontal: 32,
    paddingTop: height * 0.1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  buttonContainer: {
    width: '100%',
  },
});
