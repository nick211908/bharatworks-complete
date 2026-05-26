import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import logger from '../utils/logger';

// ─── GET /api/earnings/summary ────────────────────────────────────
// Returns a 30-day earnings summary for the authenticated worker.

export const getEarningsSummary = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const userId = req.user.id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // All payments this user received as payee in last 30 days
        const recentPayments = await prisma.payment.findMany({
            where: {
                payeeId: userId,
                status: 'completed',
                createdAt: { gte: thirtyDaysAgo },
            },
            select: {
                amount: true,
                jobId: true,
                createdAt: true,
            },
        });

        const totalEarnedFromPayments = recentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        // Fetch pending dues (not yet paid)
        const worker = await prisma.worker.findFirst({
            where: { userId },
            select: { id: true }
        });

        let totalPending = 0;
        if (worker) {
            const dues = await prisma.workerDue.findMany({
                where: { workerId: worker.id },
                select: { balanceDue: true }
            });
            totalPending = dues.reduce((sum, d) => sum + Number(d.balanceDue), 0);
        }

        const totalEarned = totalEarnedFromPayments + totalPending;

        // Count unique job IDs for "total jobs"
        const uniqueJobs = new Set(recentPayments.map(p => p.jobId).filter(Boolean));
        const totalJobs = uniqueJobs.size;

        // Count days that had at least one payment as "working days"
        const workingDaySet = new Set(
            recentPayments.map(p => p.createdAt.toISOString().split('T')[0])
        );
        const workingDays = workingDaySet.size;

        const avgDailyRate = workingDays > 0 ? Math.round(totalEarned / workingDays) : 0;

        // Previous 30-day period for growth calculation
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const prevPayments = await prisma.payment.findMany({
            where: {
                payeeId: userId,
                status: 'completed',
                createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
            select: { amount: true },
        });
        const prevTotal = prevPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const monthlyGrowth =
            prevTotal > 0 ? Math.round(((totalEarned - prevTotal) / prevTotal) * 100) : 0;

        res.json({
            totalEarned,
            totalJobs,
            workingDays,
            avgDailyRate,
            monthlyGrowth,
        });
    } catch (error: any) {
        logger.error('Get earnings summary error:', error);
        res.status(500).json({ error: 'Failed to fetch earnings summary' });
    }
};

// ─── GET /api/earnings/transactions ──────────────────────────────
// Returns the full payment transaction history for the authenticated user.

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const userId = req.user.id;

        const payments = await prisma.payment.findMany({
            where: {
                OR: [{ payerId: userId }, { payeeId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                job: { select: { title: true } },
            },
        });

        const transactions = payments.map(p => {
            const isCredit = p.payeeId === userId;
            const isPending = p.status === 'pending' || p.status === 'initiated' || p.status === 'mock_initiated';

            let type: 'credit' | 'debit' | 'pending';
            if (isPending) {
                type = 'pending';
            } else if (isCredit) {
                type = 'credit';
            } else {
                type = 'debit';
            }

            let description = 'Payment';
            if (p.job?.title) {
                description = isCredit ? `Earned from ${p.job.title}` : `Paid for ${p.job.title}`;
            } else if (p.method === 'razorpay') {
                description = 'Wallet Top-up';
            } else if (p.method === 'wallet_topup') {
                description = 'Wallet Top-up';
            } else if (p.method === 'upi_payout' || p.method === 'attendance_settlement') {
                description = isCredit ? 'Salary Received' : 'Salary Paid';
            }

            let status: 'completed' | 'pending' | 'failed';
            if (p.status === 'completed') status = 'completed';
            else if (p.status === 'failed') status = 'failed';
            else status = 'pending';

            return {
                id: p.id,
                amount: Number(p.amount),
                type,
                description,
                date: p.createdAt.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }),
                status,
            };
        });

        res.json({ transactions });
    } catch (error: any) {
        logger.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// ─── GET /api/earnings/pending ────────────────────────────────────
// Returns a breakdown of pending dues grouped by employer.

export const getPendingDues = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;

        const worker = await prisma.worker.findFirst({
            where: { userId },
            select: { id: true }
        });

        if (!worker) {
            return res.json({ pendingDues: [] });
        }

        const dues = await prisma.workerDue.findMany({
            where: { 
                workerId: worker.id,
                balanceDue: { gt: 0 }
            },
            include: {
                employer: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        const pendingDues = dues.map(d => ({
            employerId: d.employerId,
            companyName: d.employer.companyName || d.employer.user?.name || 'Unknown Employer',
            amount: Number(d.balanceDue)
        }));

        res.json({ pendingDues });
    } catch (error: any) {
        logger.error('Get pending dues error:', error);
        res.status(500).json({ error: 'Failed to fetch pending dues' });
    }
};

// ─── POST /api/earnings/request-payment ───────────────────────────
// Sends a notification to an employer requesting payment for pending dues.

export const requestPayment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
        
        const { employerId, amount } = req.body;
        if (!employerId || !amount) {
            return res.status(400).json({ error: 'Employer ID and amount are required' });
        }

        const employer = await prisma.employer.findUnique({
            where: { id: employerId }
        });

        if (!employer) {
            return res.status(404).json({ error: 'Employer not found' });
        }

        await prisma.notification.create({
            data: {
                userId: employer.userId,
                title: 'Payment Request',
                body: `${(req.user as any).name || 'A worker'} has requested a payment of ₹${amount} for pending dues.`,
                type: 'PAYMENT_REQUEST'
            }
        });

        res.json({ success: true, message: 'Payment request sent successfully' });
    } catch (error: any) {
        logger.error('Request payment error:', error);
        res.status(500).json({ error: 'Failed to send payment request' });
    }
};
