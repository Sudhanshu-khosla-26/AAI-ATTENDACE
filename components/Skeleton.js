/**
 * AAI Attendance App - Skeleton Component
 * Shimmer loading effect for data loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/colors';

const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style = {},
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Skeleton card for complex loading states
export const SkeletonCard = ({ style = {} }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={20} style={styles.cardTitle} />
      <Skeleton width="100%" height={16} style={styles.cardLine} />
      <Skeleton width="80%" height={16} style={styles.cardLine} />
      <View style={styles.cardFooter}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  );
};

// Skeleton list for list loading states
export const SkeletonList = ({ count = 3, style = {} }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    opacity: 0.5,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 12,
  },
  cardLine: {
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default Skeleton;
