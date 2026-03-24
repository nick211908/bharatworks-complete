import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

async function test_job() {
    try {
        // Find absolute fallback id that is open
        const res = await api.get('/jobs?status=open');
        if (res.data.jobs && res.data.jobs.length > 0) {
            const firstJob = res.data.jobs[0];
            const detail = await api.get(`/jobs/${firstJob.id}`);
            console.log("FULL JOB DETAIL DATA OUTPUT:");
            console.log(JSON.stringify(detail.data.job, null, 2));
        } else {
            console.log("No open jobs found to test detail params.");
        }
    } catch (e) {
        console.error("Test error:", e.response?.data || e.message);
    }
}
test_job();
