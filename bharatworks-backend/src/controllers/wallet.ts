import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const getBalance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { balance: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ balance: user.balance });
    } catch (error: any) {
        console.error('Fetch balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
};

export const topUpWallet = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        const userId = req.user.id;

        const result = await prisma.$transaction(async (tx) => {
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
    } catch (error: any) {
        console.error('Wallet top-up error:', error);
        res.status(500).json({ error: 'Failed to top up wallet' });
    }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { amount, upiId } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
        if (!upiId) return res.status(400).json({ error: 'UPI ID is required' });

        const userId = req.user.id;

        try {
            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({ where: { id: userId }, select: { balance: true } });
                if (!user) throw new Error('User not found');

                const currentBalance = Number(user.balance || 0);
                if (currentBalance < amount) {
                    throw new Error(`Insufficient balance. Current: ₹${currentBalance}`);
                }

                // Deduct balance and log payout request as a payment record
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: amount } }
                });
            });
        } catch (e: any) {
            if (e.message.includes('Insufficient balance') || e.message === 'User not found') {
                return res.status(400).json({ error: e.message });
            }
            throw e;
        }

        console.log(`[PAYOUT REQUEST] User ${userId} requested ₹${amount} to UPI: ${upiId}`);

        res.json({ message: 'Payout request submitted successfully', upiId, amount });
    } catch (error: any) {
        console.error('Payout request error:', error);
        res.status(500).json({ error: 'Failed to process payout request' });
    }
};
