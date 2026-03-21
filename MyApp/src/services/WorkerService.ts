import api from './api';

export interface WorkerData {
    name: string;
    mobile: string;
    skill: string;
    experience?: string;
    daily_wage?: string;
    latitude?: number;
    longitude?: number;
    photo_url?: string;
    agent_id?: string;
    aadhaar_number?: string;
    aadhaar_front_image?: string;
    aadhaar_back_image?: string;
}

export const WorkerService = {
    /**
     * Registers a new worker by updating the authenticated user's worker profile
     */
    async registerWorker(data: WorkerData) {
        try {
            const response = await api.post('/users/worker', {
                ...data, // Include all fields from WorkerData
                expectedWage: data.daily_wage ? parseFloat(data.daily_wage) : 0,
                latitude: data.latitude,
                longitude: data.longitude,
                availabilityStatus: 'online'
            });
            return response.data.worker;
        } catch (error) {
            throw error;
        }
    },

    async registerOfflineWorker(data: WorkerData) {
        // MVP: same as online for now
        return WorkerService.registerWorker(data);
    },

    async getOfflineWorkers() {
        // MVP: return empty list
        return [];
    },

    async getAgentStats() {
        try {
            const response = await api.get('/users/agent/profile');
            const { agent } = response.data;
            return {
                workersAdded: agent.workersAdded || 0,
                earnings: agent.earnings || 0,
                pending: agent.pending || 0,
            };
        } catch (error) {
            console.error('getAgentStats error:', error);
            return { workersAdded: 0, earnings: 0, pending: 0 };
        }
    },

    async getAgentProfile() {
        try {
            const response = await api.get('/users/agent/profile');
            return response.data.agent;
        } catch (error) {
            console.error('getAgentProfile error:', error);
            throw error;
        }
    },

    async uploadWorkerPhoto(photoData: { uri?: string, base64?: string }) {
        console.warn("uploadWorkerPhoto: Mock returning empty string as Storage not ported");
        return "mocked-photo-url.jpg";
    },

    async registerAgent(data: { agency_name: string; region: string; experience_years: string }) {
        try {
            const response = await api.post('/users/agent', {
                agencyName: data.agency_name,
                region: data.region,
                experienceYears: data.experience_years,
            });
            return response.data.agent;
        } catch (error) {
            console.error('registerAgent error:', error);
            throw error;
        }
    }
};

export const decode = (base64: string) => { return new ArrayBuffer(0); };
