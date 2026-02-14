/**
 * AAI Attendance App - Error Boundary Component
 * Catches JavaScript errors and displays a friendly error screen
 */

import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console (in production, send to error tracking service)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={80} color={Colors.error} />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            
            <Text style={styles.message}>
              We apologize for the inconvenience. An unexpected error has occurred.
            </Text>

            {this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={this.handleReset}
                variant="primary"
                style={styles.button}
              />
            </View>

            <Text style={styles.supportText}>
              If the problem persists, please contact support with error code:{'\n'}
              <Text style={styles.errorCode}>
                {Math.random().toString(36).substring(7).toUpperCase()}
              </Text>
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  supportText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorCode: {
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
