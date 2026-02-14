/**
 * AAI Attendance App - App Context
 * Manages app-wide state like offline status, notifications, and settings
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { STORAGE_KEYS, SYNC_CONFIG } from '../constants/config';
import { storeData, getData } from '../utils/storageUtils';

// Create context
const AppContext = createContext();

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// App Provider component
export const AppProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState([]);
  const [settings, setSettings] = useState({
    notifications: {
      attendanceReminders: true,
      leaveApprovals: true,
      syncNotifications: true,
    },
    theme: 'light',
    language: 'en',
    autoSync: true,
    syncFrequency: 'daily',
    wifiOnlySync: false,
    biometricLock: true,
    autoLogout: 15,
  });
  const [loading, setLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getData(STORAGE_KEYS.APP_SETTINGS, null);
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...savedSettings }));
        }
      } catch (error) {
        console.error('Load settings error:', error);
      }
    };

    loadSettings();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      
      // Auto-sync when coming back online
      if (online && settings.autoSync) {
        handleAutoSync();
      }
    });

    return () => unsubscribe();
  }, [settings.autoSync]);

  // Handle auto sync
  const handleAutoSync = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
      if (queue.length > 0) {
        await syncAllData();
      }
    } catch (error) {
      console.error('Auto sync error:', error);
    }
  }, [isSyncing]);

  // Save settings
  const saveSettings = useCallback(async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await storeData(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
      setSettings(updatedSettings);
      return { success: true };
    } catch (error) {
      console.error('Save settings error:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  }, [settings]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notificationSettings) => {
    return await saveSettings({
      notifications: { ...settings.notifications, ...notificationSettings },
    });
  }, [settings.notifications, saveSettings]);

  // Update theme
  const updateTheme = useCallback(async (theme) => {
    return await saveSettings({ theme });
  }, [saveSettings]);

  // Update language
  const updateLanguage = useCallback(async (language) => {
    return await saveSettings({ language });
  }, [saveSettings]);

  // Update sync settings
  const updateSyncSettings = useCallback(async (syncSettings) => {
    return await saveSettings({
      ...settings,
      ...syncSettings,
    });
  }, [settings, saveSettings]);

  // Get sync queue
  const getSyncQueue = useCallback(async () => {
    try {
      const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
      setSyncQueue(queue);
      return queue;
    } catch (error) {
      console.error('Get sync queue error:', error);
      return [];
    }
  }, []);

  // Sync all data
  const syncAllData = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    
    setIsSyncing(true);
    try {
      const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
      
      if (queue.length === 0) {
        return { success: true, message: 'Nothing to sync' };
      }

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear sync queue
      await storeData(STORAGE_KEYS.SYNC_QUEUE, []);
      setSyncQueue([]);

      // Update last sync time
      await storeData(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      // Show notification
      if (settings.notifications.syncNotifications) {
        await showNotification(
          'Sync Complete',
          `${queue.length} item(s) synced successfully`
        );
      }

      return {
        success: true,
        synced: queue.length,
        message: `${queue.length} item(s) synced successfully`,
      };
    } catch (error) {
      console.error('Sync all data error:', error);
      return { success: false, error: 'Sync failed' };
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, settings.notifications.syncNotifications]);

  // Add to sync queue
  const addToSyncQueue = useCallback(async (item) => {
    try {
      const queue = await getData(STORAGE_KEYS.SYNC_QUEUE, []);
      queue.push({
        id: `SYNC${Date.now()}`,
        ...item,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      await storeData(STORAGE_KEYS.SYNC_QUEUE, queue);
      setSyncQueue(queue);
      return { success: true };
    } catch (error) {
      console.error('Add to sync queue error:', error);
      return { success: false, error: 'Failed to add to queue' };
    }
  }, []);

  // Clear sync queue
  const clearSyncQueue = useCallback(async () => {
    try {
      await storeData(STORAGE_KEYS.SYNC_QUEUE, []);
      setSyncQueue([]);
      return { success: true };
    } catch (error) {
      console.error('Clear sync queue error:', error);
      return { success: false, error: 'Failed to clear queue' };
    }
  }, []);

  // Show local notification
  const showNotification = useCallback(async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Show immediately
      });
      return { success: true };
    } catch (error) {
      console.error('Show notification error:', error);
      return { success: false, error: 'Failed to show notification' };
    }
  }, []);

  // Schedule notification
  const scheduleNotification = useCallback(async (title, body, trigger, data = {}) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger,
      });
      return { success: true, notificationId };
    } catch (error) {
      console.error('Schedule notification error:', error);
      return { success: false, error: 'Failed to schedule notification' };
    }
  }, []);

  // Cancel notification
  const cancelNotification = useCallback(async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error('Cancel notification error:', error);
      return { success: false, error: 'Failed to cancel notification' };
    }
  }, []);

  // Request notification permissions
  const requestNotificationPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return { success: finalStatus === 'granted', status: finalStatus };
    } catch (error) {
      console.error('Request notification permissions error:', error);
      return { success: false, error: 'Failed to request permissions' };
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    setLoading(true);
    try {
      // Keep user session and essential data, clear only cache
      const keysToKeep = [
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.DEVICE_REGISTRATION,
        STORAGE_KEYS.ATTENDANCE_RECORDS,
        STORAGE_KEYS.LEAVE_BALANCES,
        STORAGE_KEYS.LEAVE_APPLICATIONS,
        STORAGE_KEYS.APP_SETTINGS,
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.REGISTERED_USERS,
        STORAGE_KEYS.LOCATIONS,
      ];

      const allKeys = await getData(STORAGE_KEYS.getAllKeys, []);
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
      
      for (const key of keysToRemove) {
        await storeData(key, null);
      }

      return { success: true, message: 'Cache cleared successfully' };
    } catch (error) {
      console.error('Clear cache error:', error);
      return { success: false, error: 'Failed to clear cache' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    try {
      const data = await getData(STORAGE_KEYS.exportAllData, {});
      return { success: true, data };
    } catch (error) {
      console.error('Export data error:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }, []);

  // Context value
  const value = {
    isOnline,
    isSyncing,
    syncQueue,
    settings,
    loading,
    saveSettings,
    updateNotificationSettings,
    updateTheme,
    updateLanguage,
    updateSyncSettings,
    getSyncQueue,
    syncAllData,
    addToSyncQueue,
    clearSyncQueue,
    showNotification,
    scheduleNotification,
    cancelNotification,
    requestNotificationPermissions,
    clearCache,
    exportData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
