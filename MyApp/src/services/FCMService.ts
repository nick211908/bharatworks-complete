import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request notification permission from the OS.
 * Must be called before getting the token.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            return false;
        }
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
};

/**
 * Get the FCM device token, save it to AsyncStorage,
 * and register it with our backend.
 */
export const registerFcmToken = async (): Promise<string | null> => {
    try {
        const enabled = await requestNotificationPermission();
        if (!enabled) return null;

        const token = await messaging().getToken();
        await AsyncStorage.setItem('fcmToken', token);
        await api.put('/users/fcm-token', { fcmToken: token });
        console.log('[FCM] Token registered:', token.slice(0, 20) + '...');

        return token;
    } catch (err: any) {
        console.error('[FCM] Token registration failed:', err.message);
        return null;
    }
};

/**
 * Subscribe to foreground messages.
 * Returns an unsubscribe function.
 */
export const onForegroundJobAlert = (
    callback: (job: JobAlertData) => void
): (() => void) => {
    return messaging().onMessage(async remoteMessage => {
        if (remoteMessage.data?.type === 'JOB_ALERT') {
            callback(remoteMessage.data as unknown as JobAlertData);
        }
    });
};

/**
 * Setup background & quit state message handler.
 * Call this once at the app root level.
 */
export const setupBackgroundHandler = () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        if (remoteMessage.data?.type === 'JOB_ALERT') {
            await AsyncStorage.setItem('pendingJobAlert', JSON.stringify(remoteMessage.data));
        }
    });
};

/**
 * Bootstraps FCM for a logged-in user:
 * - registers device token now
 * - keeps backend token in sync on refresh
 */
export const bootstrapFcmForAuthenticatedUser = (): (() => void) => {
    registerFcmToken().catch((e: any) => {
        console.warn('[FCM] Initial token registration failed:', e?.message || e);
    });

    return messaging().onTokenRefresh(async (token) => {
        try {
            await AsyncStorage.setItem('fcmToken', token);
            await api.put('/users/fcm-token', { fcmToken: token });
            console.log('[FCM] Token refreshed and registered');
        } catch (err: any) {
            console.error('[FCM] Token refresh registration failed:', err.message);
        }
    });
};

/**
 * Check if app was opened from a notification (killed state).
 * Returns the job data if so, and clears it.
 */
export const getPendingJobAlert = async (): Promise<JobAlertData | null> => {
    const raw = await AsyncStorage.getItem('pendingJobAlert');
    if (raw) {
        await AsyncStorage.removeItem('pendingJobAlert');
        return JSON.parse(raw) as JobAlertData;
    }
    return null;
};

export interface JobAlertData {
    type: string;
    jobId: string;
    title: string;
    wagePerDay: string;
    companyName: string;
    distanceKm: string;
    urgent: string;
    lat: string;
    lng: string;
}
