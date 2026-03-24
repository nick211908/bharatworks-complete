import express from 'express';
import { getEarningsSummary, getTransactions } from '../controllers/earnings';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/summary', authenticateToken, getEarningsSummary);
router.get('/transactions', authenticateToken, getTransactions);

export default router;
