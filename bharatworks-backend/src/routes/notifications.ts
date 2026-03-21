import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.post('/read', authenticateToken, markAsRead);

export default router;
