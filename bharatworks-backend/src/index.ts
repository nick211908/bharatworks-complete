// Load .env BEFORE any other imports that reference process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import userRoutes from './routes/users';
import walletRoutes from './routes/wallet';
import notificationRoutes from './routes/notifications';
import paymentRoutes from './routes/payment';
import ivrRoutes from './routes/ivr';
import earningsRoutes from './routes/earnings';
import logger from './utils/logger';
import requestLogger from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(requestLogger);

// Razorpay webhook needs raw body — BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

import { errorHandler } from './middleware/errorHandler';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/earnings', earningsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Final Error Handling Middleware
app.use(errorHandler);

app.listen(Number(PORT), HOST, () => {
    logger.info(`Server running on http://${HOST}:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
