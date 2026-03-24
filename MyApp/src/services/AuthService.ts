import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
    // Stores the dev-mode OTP returned by the backend (only in dev mode)
    lastDevOtp: null as string | null,

    /**
     * Sends an OTP to the provided phone number.
     * In dev mode, the backend returns the OTP in the response.
     */
    async signInWithPhone(phone: string) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        try {
            const response = await api.post('/auth/send-otp', { phone: formattedPhone });
            // In dev mode, capture the mock OTP from the response
            if (response.data?.devOtp) {
                this.lastDevOtp = response.data.devOtp;
                console.log(`[DEV] Mock OTP received: ${this.lastDevOtp}`);
            } else {
                this.lastDevOtp = null;
            }
        } catch (error: any) {
            console.error("Send OTP error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Verifies the Phone OTP.
     */
    async verifyOtp(phone: string, otp: string) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        try {
            const response = await api.post('/auth/verify-otp', { phone: formattedPhone, otp });
            const data = response.data;
            if (data.session?.access_token) {
                await AsyncStorage.setItem('userToken', data.session.access_token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return data;
        } catch (error: any) {
            console.error("Verify OTP error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Verifies the Email OTP.
     */
    async verifyEmailOtp(email: string, otp: string) {
        try {
            const response = await api.post('/auth/verify-email-otp', { email, otp });
            const data = response.data;
            if (data.session?.access_token) {
                await AsyncStorage.setItem('userToken', data.session.access_token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return data;
        } catch (error: any) {
            console.error("Verify Email OTP error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign up a new user with phone and password.
     */
    async signUpWithPassword(phone: string, password: string) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        try {
            const response = await api.post('/auth/signup', {
                phone: formattedPhone,
                password,
                role: 'worker'
            });
            const data = response.data;
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return data;
        } catch (error: any) {
            console.error("Signup error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign in an existing user with phone and password.
     */
    async signInWithPassword(phone: string, password: string) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        try {
            const response = await api.post('/auth/login', {
                phone: formattedPhone,
                password,
            });
            const data = response.data;
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return { user: data.user, session: { access_token: data.token } }; // Mapped to look like supabase response for legacy code
        } catch (error: any) {
            console.error("Login error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign in an existing user with email and password.
     */
    async signInWithEmail(email: string, password: string) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            const data = response.data;
            if (data.token) {
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return { user: data.user, session: { access_token: data.token } };
        } catch (error: any) {
            console.error("Login email error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign in with Google (Firebase ID Token).
     */
    async signInWithGoogle(idToken: string, role?: string) {
        try {
            const response = await api.post('/auth/firebase-login', {
                idToken,
                role,
            });
            const data = response.data;
            if (data.session?.access_token) {
                await AsyncStorage.setItem('userToken', data.session.access_token);
                await AsyncStorage.setItem('userId', data.user.id);
            }
            return data;
        } catch (error: any) {
            console.error("Google login error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign out the current user.
     */
    async signOut() {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
    }
};
