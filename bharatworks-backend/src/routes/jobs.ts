import express from 'express';
import { createJob, getJobs, getJobById, getNearbyJobs, applyForJob } from '../controllers/jobs';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createJobSchema, getNearbyJobsSchema } from '../validators/job.validator';

const router = express.Router();

router.post('/', authenticateToken, validateRequest(createJobSchema), createJob);
router.get('/', authenticateToken, getJobs);
router.get('/nearby', authenticateToken, validateRequest(getNearbyJobsSchema), getNearbyJobs);
router.get('/:id', authenticateToken, getJobById);
router.post('/:id/apply', authenticateToken, applyForJob);

export default router;
