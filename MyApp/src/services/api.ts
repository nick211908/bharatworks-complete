import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';

const API_PORT = 3000;
const MANUAL_DEV_HOST = process.env.EXPO_PUBLIC_API_HOST;

const getMetroHost = (): string | null => {
    const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL as string | undefined;
    if (!scriptURL) return null;

    const match = scriptURL.match(/^https?:\/\/([^/:]+):\d+/);
    return match?.[1] ?? null;
};

const getApiUrl = (): string => {
    if (!__DEV__) return 'https://api.yourproductiondomain.com/api';

    const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const host = MANUAL_DEV_HOST || getMetroHost() || fallbackHost;
    return `http://${host}:${API_PORT}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// In-memory token cache to avoid AsyncStorage latency per request
let cachedToken: string | null = null;

// Export function to set auth token (used for hydration on app start)
export const setAuthToken = (token: string | null) => {
    cachedToken = token;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
    async (config) => {
        if (!cachedToken) {
            cachedToken = await AsyncStorage.getItem('userToken');
        }
        if (cachedToken) {
            config.headers.Authorization = `Bearer ${cachedToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403 globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('[Axios Interceptor] Error Status:', error.response?.status);
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('[Axios Interceptor] 401/403 Triggered. Clearing tokens & triggering redirect.');
            cachedToken = null;
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');

            console.log('[Axios Interceptor] navigationRef.isReady():', navigationRef.isReady());
            if (navigationRef.isReady()) {
                console.log('[Axios Interceptor] Executing reset to Opening');
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: 'Opening' }],
                });
            } else {
                console.warn('[Axios Interceptor] navigationRef is NOT ready yet!');
                // Fallback attempt after short delay if container is mounting
                setTimeout(() => {
                    if (navigationRef.isReady()) {
                        console.log('[Axios Interceptor] Retry: Executing reset to Opening');
                        navigationRef.reset({ index: 0, routes: [{ name: 'Opening' }] });
                    }
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
