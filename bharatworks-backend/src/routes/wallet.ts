import express from 'express';
import { getBalance, topUpWallet, requestPayout } from '../controllers/wallet';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/balance', authenticateToken, getBalance);
router.post('/topup', authenticateToken, topUpWallet);
router.post('/payout-request', authenticateToken, requestPayout);

export default router;
