/**
 * AAI Attendance App - Card Component
 * Reusable card with AAI branding
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';

const Card = ({
  children,
  onPress,
  style = {},
  contentStyle = {},
  padding = 16,
  elevation = 2,
  borderRadius = 12,
  backgroundColor = Colors.background,
  disabled = false,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          padding,
          borderRadius,
          backgroundColor,
          elevation,
          shadowOpacity: elevation > 0 ? 0.1 : 0,
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginVertical: 8,
    marginHorizontal: 0,
  },
  content: {
    width: '100%',
  },
});

export default Card;
