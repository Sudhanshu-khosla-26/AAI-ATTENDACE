/**
 * AAI Attendance App - API Configuration
 * Central backend API configuration for React Native → Next.js
 *
 * HOW TO SET YOUR IP:
 *  1. On your computer, run: ipconfig (Windows) or ifconfig / ip addr (Linux/Mac)
 *  2. Find your local network IP (e.g. 192.168.1.105)
 *  3. Replace the placeholder below with that IP
 *  4. Make sure Next.js server is running: npm run dev
 *  5. Both devices must be on the same WiFi network
 *
 * Android Emulator → use: http://10.0.2.2:3000
 * iOS Simulator    → use: http://localhost:3000
 * Physical Device  → use: http://<YOUR_LAN_IP>:3000
 */

import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (!__DEV__) return 'https://your-production-domain.com';

    // For Expo Web (browser), always connect via localhost to avoid CORS/LAN issues on the same machine
    if (Platform.OS === 'web') return 'http://localhost:3000';

    // For Native Android/iOS (on same network), use the machine's LAN IP
    // Current Machine IP: 172.20.10.2
    return 'http://172.20.10.2:3000';
};

export const API_BASE_URL = getBaseUrl();

export const API_TIMEOUT = 15000; // 15 seconds

export const API_ENDPOINTS = {
    // ─── Auth ────────────────────────────────────────────────────────────────
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',

    // ─── Attendance ──────────────────────────────────────────────────────────
    ATTENDANCE: '/api/attendance',
    CHECK_IN: '/api/attendance/check-in',
    CHECK_OUT: '/api/attendance/check-out',
    ATTENDANCE_TODAY: '/api/attendance/today',
    ATTENDANCE_STATS: '/api/attendance/stats',
    ATTENDANCE_HISTORY: '/api/attendance',
    CHECK_GEOFENCE: '/api/attendance/check-geofence',

    // ─── Leaves ──────────────────────────────────────────────────────────────
    LEAVES: '/api/leaves',
    LEAVE_BALANCE: '/api/leaves/balance',
    LEAVE_APPLY: '/api/leaves',
    LEAVE_CANCEL: (id) => `/api/leaves/${id}/cancel`,
    LEAVE_APPROVE: (id) => `/api/leaves/${id}/approve`,
    LEAVE_REJECT: (id) => `/api/leaves/${id}/reject`,

    // ─── Locations ───────────────────────────────────────────────────────────
    LOCATIONS: '/api/locations',
    LOCATION_BY_ID: (id) => `/api/locations/${id}`,
    LOCATION_ASSIGN_ADMIN: (id) => `/api/locations/${id}`, // PATCH with adminId

    // ─── Users (admin) ───────────────────────────────────────────────────────
    USERS: '/api/users',
    USER_BY_ID: (id) => `/api/users/${id}`,
    USER_APPROVE: (id) => `/api/users/${id}/approve`,
    USER_REJECT: (id) => `/api/users/${id}/reject`,

    // ─── Photo Upload ────────────────────────────────────────────────────────
    UPLOAD_PHOTO: '/api/upload/attendance-photo',
    UPLOAD_PROFILE_PHOTO: '/api/upload/profile-photo',
};

export default API_BASE_URL;
