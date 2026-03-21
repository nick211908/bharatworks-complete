"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.verifyRazorpaySignature = exports.createRazorpayOrder = exports.isDev = exports.getRazorpayClient = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
// Lazy-init: Razorpay client is created on first use to ensure env vars are loaded
let _razorpayClient = null;
const getRazorpayClient = () => {
    if (!_razorpayClient) {
        _razorpayClient = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
        });
    }
    return _razorpayClient;
};
exports.getRazorpayClient = getRazorpayClient;
// Check at call-time, not module-load-time
const isDev = () => {
    const key = process.env.RAZORPAY_KEY_ID;
    const result = !key || key === 'rzp_test_placeholder';
    if (result) {
        console.log(`[RAZORPAY] Running in MOCK mode (key: ${key || 'NOT SET'})`);
    }
    return result;
};
exports.isDev = isDev;
/**
 * Creates a Razorpay order.
 * @param amountInRupees - e.g. 500 (will be converted to paise: 50000)
 * @param receipt - unique receipt ID for this order
 */
const createRazorpayOrder = async (amountInRupees, receipt) => {
    if ((0, exports.isDev)()) {
        const mockId = `order_mock_${Date.now()}`;
        console.log(`[MOCK RAZORPAY] Created order ${mockId} for ₹${amountInRupees}`);
        return { id: mockId, amount: amountInRupees * 100, currency: 'INR' };
    }
    const order = await (0, exports.getRazorpayClient)().orders.create({
        amount: amountInRupees * 100, // paise
        currency: 'INR',
        receipt,
    });
    return { id: order.id, amount: Number(order.amount), currency: order.currency };
};
exports.createRazorpayOrder = createRazorpayOrder;
/**
 * Verifies Razorpay payment signature.
 * Returns true if valid.
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    if ((0, exports.isDev)()) {
        console.log(`[MOCK RAZORPAY] Verifying signature for order ${orderId} payment ${paymentId}`);
        return true;
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    return expectedSignature === signature;
};
exports.verifyRazorpaySignature = verifyRazorpaySignature;
/**
 * Verifies Razorpay webhook signature.
 */
const verifyWebhookSignature = (rawBody, signature) => {
    if ((0, exports.isDev)())
        return true;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    return expectedSignature === signature;
};
exports.verifyWebhookSignature = verifyWebhookSignature;
//# sourceMappingURL=razorpay.js.map