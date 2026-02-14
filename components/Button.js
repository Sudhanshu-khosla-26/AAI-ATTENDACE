/**
 * AAI Attendance App - Button Component (OPTIMIZED)
 * Reusable button with AAI branding - Memoized to prevent unnecessary re-renders
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger, success
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left', // left, right
  style = {},
  textStyle = {},
  fullWidth = false,
}) => {
  // ✅ Memoize button colors calculation
  const colors = useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          background: disabled ? Colors.textLight : Colors.primary,
          text: Colors.textWhite,
          border: Colors.primary,
        };
      case 'secondary':
        return {
          background: disabled ? Colors.backgroundSecondary : Colors.saffron,
          text: Colors.textWhite,
          border: Colors.saffron,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: disabled ? Colors.textLight : Colors.primary,
          border: disabled ? Colors.border : Colors.primary,
        };
      case 'danger':
        return {
          background: disabled ? Colors.errorLight : Colors.error,
          text: Colors.textWhite,
          border: Colors.error,
        };
      case 'success':
        return {
          background: disabled ? Colors.successLight : Colors.success,
          text: Colors.textWhite,
          border: Colors.success,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: disabled ? Colors.textLight : Colors.primary,
          border: 'transparent',
        };
      default:
        return {
          background: disabled ? Colors.textLight : Colors.primary,
          text: Colors.textWhite,
          border: Colors.primary,
        };
    }
  }, [variant, disabled]);

  // ✅ Memoize size styles calculation
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  }, [size]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.fontSize + 4}
              color={colors.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.fontSize + 4}
              color={colors.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

// ✅ CRITICAL: Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(Button);