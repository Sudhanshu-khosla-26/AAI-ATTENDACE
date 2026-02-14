import React, { useState, useCallback, forwardRef, memo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

/**
 * AAI Attendance App - Input Component
 * Using forwardRef as a function to ensure focus is captured by the native TextInput
 */
function InputComponent({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  helper,
  icon,
  iconRight,
  onIconPress,
  onRightIconPress,
  style = {},
  inputStyle = {},
  labelStyle = {},
  required = false,
  ...props
}, ref) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Handle local focus state and bubble up prop handlers
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const isPassword = secureTextEntry;
  const showPasswordToggle = isPassword && !iconRight;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <TouchableOpacity onPress={onIconPress} disabled={!onIconPress}>
            <Ionicons
              name={icon}
              size={20}
              color={error ? Colors.error : isFocused ? Colors.primary : Colors.textLight}
              style={styles.iconLeft}
            />
          </TouchableOpacity>
        )}

        <TextInput
          ref={ref} // <--- The function now correctly passes the ref to the native engine
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity onPress={togglePasswordVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textLight}
              style={styles.iconRight}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

// Wrap the function component
const Input = memo(forwardRef(InputComponent));

export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  required: { color: Colors.error },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: { borderColor: Colors.primary, elevation: 2 },
  inputContainerError: { borderColor: Colors.error },
  inputContainerDisabled: { backgroundColor: '#F5F5F5' },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 12 },
  inputMultiline: { textAlignVertical: 'top', minHeight: 80, paddingTop: 12 },
  iconLeft: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
  helperText: { fontSize: 12, color: '#999', marginTop: 4 },
});