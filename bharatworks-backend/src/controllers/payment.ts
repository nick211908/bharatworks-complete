import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import {
    createRazorpayOrder,
    verifyRazorpaySignature,
    verifyWebhookSignature,
    isDev,
} from '../services/razorpay';
import { sendPaymentReceiptEmail } from '../services/email';
import axios from 'axios';

// ─── Verify UPI VPA (Virtual Payment Address) ────────────────────

export const verifyVpa = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const { upiId } = req.body;
        if (!upiId || !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
            return res.status(400).json({ isValid: false, message: 'Invalid UPI ID format' });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Try real Razorpay VPA validation (only works with live keys)
        if (keyId && keySecret && !keyId.startsWith('rzp_test_')) {
            try {
                const response = await axios.post(
                    'https://api.razorpay.com/v1/payments/validate/vpa',
                    { vpa: upiId },
                    {
                        auth: { username: keyId, password: keySecret },
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const { customer_name, success } = response.data;
                return res.json({
                    isValid: success === true,
                    name: customer_name || upiId,
                });
            } catch (apiErr: any) {
                // If Razorpay explicitly says VPA is invalid
                if (apiErr.response?.status === 400 && apiErr.response?.data?.error) {
                    return res.json({ isValid: false, message: 'UPI ID not recognized by bank' });
                }
                // For other API errors, fall through to format-based validation
                console.warn('[VPA] Razorpay API error, using format validation:', apiErr.message);
            }
        }

        // Format-based validation (test mode or API unavailable)
        // The UPI format is already validated above, so if we reach here the format is valid
        const namePart = upiId.split('@')[0].replace(/[0-9.]/g, '') || 'User';
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        console.log(`[VPA] Format-validated ${upiId} (test mode — live keys required for bank verification)`);
        res.json({
            isValid: true,
            name: displayName,
        });
    } catch (error: any) {
        console.error('VPA verification error:', error.message);
        res.status(500).json({ isValid: false, message: 'VPA verification failed' });
    }
};

// ─── Create Razorpay Order (for wallet top-up) ───────────────────

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const { amount } = req.body;
        if (!amount || amount <= 0 || amount > 100000) {
            return res.status(400).json({ error: 'Amount must be between ₹1 and ₹1,00,000' });
        }

        const receipt = `rcpt_${req.user.id.slice(0, 8)}_${Date.now()}`;
        const order = await createRazorpayOrder(amount, receipt);

        res.json({
            orderId: order.id,
            amount: order.amount,   // in paise
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

// ─── Verify Payment & Credit Wallet ──────────────────────────────

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification data' });
        }

        // Verify the Razorpay signature
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        const userId = req.user.id;
        const amountInRupees = amount / 100; // convert paise → rupees

        // Credit wallet and create payment record in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amountInRupees } },
                select: { id: true, name: true, email: true, phone: true, balance: true },
            });

            const payment = await tx.payment.create({
                data: {
                    payerId: userId,
                    payeeId: userId,
                    amount: amountInRupees,
                    method: 'razorpay',
                    status: 'completed',
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    confirmedAt: new Date(),
                    idempotencyKey: razorpay_payment_id,
                },
            });

            return { updatedUser, payment };
        });

        // Send receipt email (non-blocking)
        if (result.updatedUser.email) {
            sendPaymentReceiptEmail(
                result.updatedUser.email,
                result.updatedUser.name || '',
                amountInRupees,
                razorpay_payment_id,
                'topup'
            ).catch((err) => console.error('[EMAIL ERROR] Receipt email failed:', err.message));
        }

        res.json({
            message: 'Payment successful. Wallet credited.',
            balance: result.updatedUser.balance,
            payment: result.payment,
        });
    } catch (error: any) {
        // Handle duplicate payment (idempotency key conflict)
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'This payment has already been processed' });
        }
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// ─── Razorpay Webhook ─────────────────────────────────────────────
// Razorpay calls this URL to confirm payment events.
// Register it in your Razorpay dashboard → Settings → Webhooks

export const razorpayWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;
        const rawBody = JSON.stringify(req.body);

        if (!verifyWebhookSignature(rawBody, signature)) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload?.payment?.entity;

        console.log(`[RAZORPAY WEBHOOK] Event: ${event}`, payload?.id);

        if (event === 'payment.captured' && payload) {
            const paymentId = payload.id;
            const orderId = payload.order_id;
            const amountInRupees = payload.amount / 100;
            const notes = payload.notes || {};

            // Find pending payment record (if created via createOrder)
            const existing = await prisma.payment.findFirst({
                where: { razorpayOrderId: orderId, status: 'pending' },
                include: { payer: { select: { id: true, email: true, name: true } } },
            });

            if (existing) {
                await prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: existing.id },
                        data: {
                            razorpayPaymentId: paymentId,
                            status: 'completed',
                            confirmedAt: new Date(),
                        },
                    });
                    await tx.user.update({
                        where: { id: existing.payerId },
                        data: { balance: { increment: amountInRupees } },
                    });
                });

                if (existing.payer.email) {
                    sendPaymentReceiptEmail(
                        existing.payer.email,
                        existing.payer.name || '',
                        amountInRupees,
                        paymentId,
                        'topup'
                    ).catch(console.error);
                }
            }
        }

        res.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// ─── Worker Payout ───────────────────────────────────────────────

export const payout = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const { amount, upiId, workerId } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
        if (!upiId) return res.status(400).json({ error: 'UPI ID is required' });

        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true, name: true, email: true },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const currentBalance = Number(user.balance || 0);
        if (currentBalance < amount) {
            return res.status(400).json({ error: `Insufficient balance. Current: ₹${currentBalance}` });
        }

        const payeeId = workerId || userId;

        const payment = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amount } },
            });

            return tx.payment.create({
                data: {
                    payerId: userId,
                    payeeId,
                    amount,
                    method: 'upi_payout',
                    status: isDev() ? 'mock_initiated' : 'initiated',
                    idempotencyKey: `payout_${userId}_${Date.now()}`,
                },
            });
        });

        if (!isDev()) {
            // Production: trigger Razorpay payout via their Payouts API
            // Requires Razorpay Banking/Payouts product activation
            console.log(`[RAZORPAY PAYOUT] ₹${amount} to UPI ${upiId} | txn: ${payment.id}`);
            // TODO: razorpayClient.payouts.create({ ... }) when banking is enabled
        } else {
            console.log(`[MOCK PAYOUT] ₹${amount} to UPI ${upiId}`);
        }

        // Send payout notification email
        if (user.email) {
            sendPaymentReceiptEmail(user.email, user.name || '', amount, payment.id, 'payout')
                .catch((err) => console.error('[EMAIL ERROR]', err.message));
        }

        res.json({
            message: 'Payout initiated successfully',
            upiId,
            amount,
            payment,
        });
    } catch (error: any) {
        console.error('Payout error:', error);
        res.status(500).json({ error: 'Failed to process payout' });
    }
};

// ─── Payment History ─────────────────────────────────────────────

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const payments = await prisma.payment.findMany({
            where: {
                OR: [{ payerId: req.user.id }, { payeeId: req.user.id }],
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json({ payments });
    } catch (error: any) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};
