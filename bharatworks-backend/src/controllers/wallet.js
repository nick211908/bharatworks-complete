"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.topUpWallet = exports.getBalance = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getBalance = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { balance: true }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ balance: user.balance });
    }
    catch (error) {
        console.error('Fetch balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
};
exports.getBalance = getBalance;
const topUpWallet = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }
        const userId = req.user.id;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });
            const payment = await tx.payment.create({
                data: {
                    payerId: userId,
                    payeeId: userId,
                    amount,
                    method: 'wallet_topup',
                    status: 'completed',
                    idempotencyKey: Math.random().toString(36).substring(7) + Date.now().toString()
                }
            });
            return { updatedUser, payment };
        });
        res.json({ message: 'Top up successful', balance: result.updatedUser.balance, payment: result.payment });
    }
    catch (error) {
        console.error('Wallet top-up error:', error);
        res.status(500).json({ error: 'Failed to top up wallet' });
    }
};
exports.topUpWallet = topUpWallet;
const requestPayout = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const { amount, upiId } = req.body;
        if (!amount || amount <= 0)
            return res.status(400).json({ error: 'Amount must be positive' });
        if (!upiId)
            return res.status(400).json({ error: 'UPI ID is required' });
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId }, select: { balance: true } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const currentBalance = Number(user.balance || 0);
        if (currentBalance < amount) {
            return res.status(400).json({ error: `Insufficient balance. Current: ₹${currentBalance}` });
        }
        // Deduct balance and log payout request as a payment record
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { balance: { decrement: amount } }
        });
        console.log(`[PAYOUT REQUEST] User ${userId} requested ₹${amount} to UPI: ${upiId}`);
        res.json({ message: 'Payout request submitted successfully', upiId, amount });
    }
    catch (error) {
        console.error('Payout request error:', error);
        res.status(500).json({ error: 'Failed to process payout request' });
    }
};
exports.requestPayout = requestPayout;
//# sourceMappingURL=wallet.js.map