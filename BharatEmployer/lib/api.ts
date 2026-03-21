import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const API_PORT = 3000;
const MANUAL_DEV_HOST = '13.217.29.118'; // Set IP for physical device testing

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

// Request interceptor to attach JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
