"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controllers/payment");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Webhook must use raw body — registered BEFORE express.json() parsing
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), payment_1.razorpayWebhook);
// Authenticated payment routes
router.post('/create-order', auth_1.authenticateToken, payment_1.createOrder);
router.post('/verify', auth_1.authenticateToken, payment_1.verifyPayment);
router.post('/verify-vpa', auth_1.authenticateToken, payment_1.verifyVpa);
router.post('/payout', auth_1.authenticateToken, payment_1.payout);
router.get('/history', auth_1.authenticateToken, payment_1.getPaymentHistory);
exports.default = router;
//# sourceMappingURL=payment.js.map