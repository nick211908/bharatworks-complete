import express from 'express';
import {
    signup,
    login,
    getUser,
    sendOtp,
    verifyOtp,
    updatePassword,
    sendEmailOtp,
    verifyEmailOtp,
    firebaseLogin,
} from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Phone OTP
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Email OTP
router.post('/send-email-otp', sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);

// OAuth
router.post('/firebase-login', firebaseLogin);

// Authenticated
router.get('/me', authenticateToken, getUser);
router.post('/update-password', authenticateToken, updatePassword);

export default router;
