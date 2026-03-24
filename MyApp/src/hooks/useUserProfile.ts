import { useEffect, useState } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    id: string;
    name: string | null;
    phone: string | null;
    roles: string[];
    photoUrl?: string | null;
    // Worker specific fields
    worker_id?: string;
    expected_wage?: number;
    reliability_score?: number;
    verification_status?: string;
}

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await api.get('/auth/me');
                const { user } = response.data;

                setProfile({
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    roles: user.roles,
                    photoUrl: user.photoUrl,
                    worker_id: user.workers?.[0]?.id,
                    expected_wage: user.workers?.[0]?.expectedWage,
                    reliability_score: user.workers?.[0]?.reliabilityScore,
                    verification_status: user.workers?.[0]?.verificationStatus,
                });

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return { profile, loading };
}
