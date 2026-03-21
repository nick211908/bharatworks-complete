import express from 'express';
import {
    createEmployerProfile,
    createWorkerProfile,
    updateWorkerLocation,
    updateUserProfile,
    createAgentProfile,
    getAgentProfile,
    registerFcmToken,
    searchWorkers,
    saveEmployerAttendanceReport,
    acceptEmployerJobPayment,
    getEmployerJobsWithWorkers,
    getEmployerWorkersWithAttendance,
    markWorkerAttendance,
    payWorker,
    getWorkerAttendanceHistory,
} from '../controllers/users';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/employer', authenticateToken, createEmployerProfile);
router.post('/worker', authenticateToken, createWorkerProfile);
router.put('/worker/location', authenticateToken, updateWorkerLocation);
router.patch('/profile', authenticateToken, updateUserProfile);
router.post('/agent', authenticateToken, createAgentProfile);
router.get('/agent/profile', authenticateToken, getAgentProfile);
router.put('/fcm-token', authenticateToken, registerFcmToken);
router.get('/workers', authenticateToken, searchWorkers);
router.post('/employer/attendance', authenticateToken, saveEmployerAttendanceReport);
router.post('/employer/jobs/:jobId/accept-payment', authenticateToken, acceptEmployerJobPayment);
router.get('/employer/jobs-with-workers', authenticateToken, getEmployerJobsWithWorkers);

// New attendance register routes
router.get('/employer/workers-attendance', authenticateToken, getEmployerWorkersWithAttendance);
router.post('/employer/attendance/mark', authenticateToken, markWorkerAttendance);
router.post('/employer/workers/:workerId/pay', authenticateToken, payWorker);
router.get('/employer/workers/:workerId/attendance-history', authenticateToken, getWorkerAttendanceHistory);

export default router;

