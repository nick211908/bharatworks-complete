import api from './api';

export interface Job {
    id: string;
    title: string;
    employer_id: string;
    wage_per_day: number;
    lat: number;
    lng: number;
    status: string;
    created_at: string;
    slots_total: number;
    slots_reserved: number;
    urgent: boolean;
    distance_meters?: number;
    company_name?: string;
    employer?: any;
}

export interface NearbyJob extends Job {
    distance_meters: number;
    company_name: string;
}

export const JobService = {
    /**
     * Fetch all open jobs.
     */
    async getAvailableJobs() {
        try {
            const response = await api.get('/jobs?status=open');
            return response.data.jobs as Job[];
        } catch (error) {
            console.error('getAvailableJobs error:', error);
            throw error;
        }
    },

    /**
     * Fetch jobs near lat/lng (Mocked back to getAvailableJobs just for functional port unless geospatial added to Express)
     */
    async fetchJobsNearby(lat: number, lng: number, radiusKm: number = 50): Promise<NearbyJob[]> {
        // Fallback to fetch all since we didn't implement PostGIS in Express MVP
        console.log(`fetchJobsNearby fallbacks to all jobs: lat=${lat}, lng=${lng}`);
        try {
            const response = await api.get('/jobs?status=open');
            const jobs = response.data.jobs.map((j: Job) => ({
                ...j,
                distance_meters: 1000,
                company_name: j.employer?.companyName || j.employer?.user?.name || 'Company'
            }));
            return jobs as NearbyJob[];
        } catch (error) {
            console.error('fetchJobsNearby error:', error);
            throw error;
        }
    },

    /**
     * Apply for a job.
     */
    async applyForJob(jobId: string, workerId: string) {
        try {
            const response = await api.post(`/jobs/${jobId}/apply`, {});
            return response.data.reservation;
        } catch (error: any) {
            console.error('applyForJob error:', error.response?.data || error.message);
            throw error;
        }
    },


    /**
     * Fetch a single job by ID.
     */
    async getJobById(jobId: string) {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            return response.data.job;
        } catch (error) {
            console.error('getJobById error:', error);
            throw error;
        }
    },

    // Migrating notifications inside JobService to NotificationService in logic, leaving these as passes
    async fetchNotifications(userId: string) {
        try {
            const response = await api.get('/notifications');
            return response.data.notifications;
        } catch (error) {
            throw error;
        }
    },

    async markNotificationRead(notificationId: string) {
        try {
            await api.post('/notifications/read', { id: notificationId });
        } catch (error) {
            throw error;
        }
    }
};
