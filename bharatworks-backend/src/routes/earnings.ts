import express from 'express';
import { getEarningsSummary, getTransactions, getPendingDues, requestPayment } from '../controllers/earnings';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/summary', authenticateToken, getEarningsSummary);
router.get('/transactions', authenticateToken, getTransactions);
router.get('/pending', authenticateToken, getPendingDues);
router.post('/request-payment', authenticateToken, requestPayment);

export default router;
