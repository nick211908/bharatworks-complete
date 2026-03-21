import express from 'express';
import {
    createOrder,
    verifyPayment,
    razorpayWebhook,
    payout,
    getPaymentHistory,
    verifyVpa,
} from '../controllers/payment';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Webhook must use raw body — registered BEFORE express.json() parsing
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

// Authenticated payment routes
router.post('/create-order', authenticateToken, createOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/verify-vpa', authenticateToken, verifyVpa);
router.post('/payout', authenticateToken, payout);
router.get('/history', authenticateToken, getPaymentHistory);

// Alias routes used by Employer app
router.post('/wallet/add', authenticateToken, createOrder);         // Creates a Razorpay order for wallet top-up
router.get('/wallet/transactions', authenticateToken, getPaymentHistory); // Lists payment history as transactions

export default router;
