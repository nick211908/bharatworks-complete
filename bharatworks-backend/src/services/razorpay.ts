import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger';

// Lazy-init: Razorpay client is created on first use to ensure env vars are loaded
let _razorpayClient: Razorpay | null = null;

export const getRazorpayClient = (): Razorpay => {
    if (!_razorpayClient) {
        _razorpayClient = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
        });
    }
    return _razorpayClient;
};

// Check at call-time, not module-load-time
export const isDev = (): boolean => {
    const key = process.env.RAZORPAY_KEY_ID;
    const result = !key || key === 'rzp_test_placeholder';
    if (result) {
        logger.debug(`[RAZORPAY] Running in MOCK mode (key: ${key || 'NOT SET'})`);
    }
    return result;
};

/**
 * Creates a Razorpay order.
 * @param amountInRupees - e.g. 500 (will be converted to paise: 50000)
 * @param receipt - unique receipt ID for this order
 */
export const createRazorpayOrder = async (
    amountInRupees: number,
    receipt: string
): Promise<{ id: string; amount: number; currency: string }> => {
    if (isDev()) {
        const mockId = `order_mock_${Date.now()}`;
        logger.debug(`[MOCK RAZORPAY] Created order ${mockId} for ₹${amountInRupees}`);
        return { id: mockId, amount: amountInRupees * 100, currency: 'INR' };
    }

    const order = await getRazorpayClient().orders.create({
        amount: amountInRupees * 100, // paise
        currency: 'INR',
        receipt,
    });

    return { id: order.id, amount: Number(order.amount), currency: order.currency };
};

/**
 * Verifies Razorpay payment signature.
 * Returns true if valid.
 */
export const verifyRazorpaySignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean => {
    if (isDev()) {
        logger.debug(`[MOCK RAZORPAY] Verifying signature for order ${orderId} payment ${paymentId}`);
        return true;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return expectedSignature === signature;
};

/**
 * Verifies Razorpay webhook signature.
 */
export const verifyWebhookSignature = (
    rawBody: string,
    signature: string
): boolean => {
    if (isDev()) return true;

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    return expectedSignature === signature;
};
