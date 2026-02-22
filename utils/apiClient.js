/**
 * AAI Attendance App - Central API Client
 * Handles all HTTP communication to the Next.js backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

const TOKEN_KEY = '@auth_token';

// ─── Token Management ────────────────────────────────────────────────────────

export const storeToken = async (token) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const clearToken = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
};

// ─── Core Request Function ───────────────────────────────────────────────────

const request = async (method, endpoint, body = null, extraHeaders = {}) => {
    const token = await getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...extraHeaders,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    // Timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT || 15000);

    try {
        const config = {
            method,
            headers,
            signal: controller.signal,
        };

        if (body && method !== 'GET' && method !== 'DELETE') {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Parse the response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { message: await response.text() };
        }

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || `HTTP ${response.status}`,
                status: response.status,
                ...data,
            };
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
            return { success: false, error: 'Request timed out. Please check your network connection.' };
        }

        if (err.message === 'Network request failed' || err.message?.includes('fetch')) {
            return {
                success: false,
                error: 'Cannot connect to server. Make sure:\n• Backend is running (npm run dev)\n• Your IP in constants/api.js is correct\n• Both devices are on the same WiFi',
            };
        }

        console.error(`[apiClient] ${method} ${endpoint} error:`, err.message);
        return { success: false, error: err.message || 'Unexpected error occurred' };
    }
};

// ─── HTTP Method Helpers ─────────────────────────────────────────────────────

export const api = {
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, body) => request('POST', endpoint, body),
    put: (endpoint, body) => request('PUT', endpoint, body),
    patch: (endpoint, body) => request('PATCH', endpoint, body),
    delete: (endpoint) => request('DELETE', endpoint),
};

// ─── File Upload ─────────────────────────────────────────────────────────────

export const uploadFile = async (endpoint, fileUri, fieldName = 'photo', extraFields = {}) => {
    const token = await getToken();

    const formData = new FormData();

    // Determine MIME type from URI
    const ext = fileUri.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `${fieldName}_${Date.now()}.${ext || 'jpg'}`;

    formData.append(fieldName, {
        uri: fileUri,
        type: mimeType,
        name: fileName,
    });

    // Append extra fields
    Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for uploads

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.message || `Upload failed: HTTP ${response.status}` };
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        console.error('[apiClient] uploadFile error:', err.message);
        return { success: false, error: 'Photo upload failed. Check your connection.' };
    }
};

export default api;
