import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const API_PORT = 3000;
const MANUAL_DEV_HOST = process.env.API_BASE_URL;

const getMetroHost = (): string | null => {
    const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL as string | undefined;
    if (!scriptURL) return null;

    const match = scriptURL.match(/^https?:\/\/([^/:]+):\d+/);
    return match?.[1] ?? null;
};

const PRODUCTION_API_URL = 'https://api.yourproductiondomain.com/api'; // Configure this

const getApiUrl = (): string => {
    if (!__DEV__) return PRODUCTION_API_URL;

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

// Load token once at startup
AsyncStorage.getItem('userToken').then(token => { cachedToken = token; });

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
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
