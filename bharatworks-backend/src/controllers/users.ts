import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

type AttendanceStatus = 'PRESENT' | 'HALF' | 'ABSENT';

const ATTENDANCE_TO_RESERVATION_STATUS: Record<AttendanceStatus, string> = {
    PRESENT: 'ATT_PRESENT',
    HALF: 'ATT_HALF',
    ABSENT: 'ATT_ABSENT',
};

const RESERVATION_TO_ATTENDANCE_STATUS: Record<string, AttendanceStatus> = {
    ATT_PRESENT: 'PRESENT',
    ATT_HALF: 'HALF',
    ATT_ABSENT: 'ABSENT',
};

const PAYABLE_ATTENDANCE: AttendanceStatus[] = ['PRESENT', 'HALF'];

export const createEmployerProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { employerType, companyName, billingAddress } = req.body;

        // Use upsert to avoid crashes if employer already exists
        const employer = await prisma.employer.upsert({
            where: { id: (await prisma.employer.findFirst({ where: { userId: req.user.id } }))?.id || '00000000-0000-0000-0000-000000000000' },
            update: { employerType, companyName, billingAddress },
            create: {
                userId: req.user.id,
                employerType,
                companyName,
                billingAddress
            }
        });

        res.status(201).json({ employer });
    } catch (error: any) {
        console.error('Employer profile creation error:', error);
        res.status(500).json({ error: 'Failed to create employer profile' });
    }
}

export const createWorkerProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { expectedWage, latitude, longitude, geohash, availabilityStatus, documents } = req.body;

        // Check if worker already exists for this user
        const existingWorker = await prisma.worker.findFirst({ where: { userId: req.user.id } });

        let worker;
        if (existingWorker) {
            // Update existing worker instead of crashing
            worker = await prisma.worker.update({
                where: { id: existingWorker.id },
                data: {
                    ...(expectedWage !== undefined && { expectedWage }),
                    ...(latitude !== undefined && { latitude }),
                    ...(longitude !== undefined && { longitude }),
                    ...(geohash !== undefined && { geohash }),
                    ...(availabilityStatus !== undefined && { availabilityStatus }),
                    ...(documents !== undefined && { documents }),
                }
            });
        } else {
            // Create new worker
            const workerData: any = {
                userId: req.user.id,
                availabilityStatus: availabilityStatus || 'online',
                verificationStatus: 'pending'
            };

            if (typeof req.user.phone === 'string' && req.user.phone) workerData.phone = req.user.phone;
            if (expectedWage !== undefined) workerData.expectedWage = expectedWage;
            if (latitude !== undefined) workerData.latitude = latitude;
            if (longitude !== undefined) workerData.longitude = longitude;
            if (geohash !== undefined) workerData.geohash = geohash;
            if (documents !== undefined) workerData.documents = documents;

            worker = await prisma.worker.create({ data: workerData });
        }

        res.status(201).json({ worker });
    } catch (error: any) {
        console.error('Worker profile creation error:', error);
        res.status(500).json({ error: 'Failed to create worker profile' });
    }
};

export const updateWorkerLocation = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const worker = await prisma.worker.findFirst({ where: { userId: req.user.id } });
        if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

        const { latitude, longitude, geohash } = req.body;

        const updatedWorker = await prisma.worker.update({
            where: { id: worker.id },
            data: { latitude, longitude, geohash }
        });

        res.json({ worker: updatedWorker });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update location' });
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
        const { name, email, photoUrl } = req.body;
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
        });
        // Fetch updated user without password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (user) delete (user as any).password;
        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const createAgentProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const { agencyName, region, experienceYears } = req.body;

        // Ensure user has agent role
        await prisma.user.update({
            where: { id: req.user.id },
            data: { roles: { push: 'agent' } }
        });

        // Create or update agent record
        const existingAgent = await prisma.agent.findFirst({ where: { userId: req.user.id } });
        let agent;
        if (existingAgent) {
            agent = await prisma.agent.update({
                where: { id: existingAgent.id },
                data: { operationalArea: region }
            });
        } else {
            agent = await prisma.agent.create({
                data: {
                    userId: req.user.id,
                    operationalArea: region
                }
            });
        }

        // Store extra details in user name for now
        await prisma.user.update({
            where: { id: req.user.id },
            data: { name: agencyName || req.user.phone }
        });

        res.status(201).json({ agent });
    } catch (error: any) {
        console.error('Agent registration error:', error);
        res.status(500).json({ error: 'Failed to register agent' });
    }
};

export const getAgentProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        const agent = await prisma.agent.findFirst({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: {
                        id: true, name: true, phone: true, roles: true, email: true, balance: true
                    }
                },
                workersCreated: true
            }
        });

        if (!agent) return res.status(404).json({ error: 'Agent profile not found' });

        res.json({
            agent: {
                id: agent.id,
                name: agent.user.name,
                phone: agent.user.phone,
                operationalArea: agent.operationalArea,
                workersAdded: agent.workersCreated.length,
                earnings: 0, // MVP placeholder
                pending: 0,  // MVP placeholder
                rank: 'Bronze Agent',
                displayId: agent.id.substring(0, 8).toUpperCase()
            }
        });
    } catch (error: any) {
        console.error('Get agent profile error:', error);
        res.status(500).json({ error: 'Failed to get agent profile' });
    }
};

export const registerFcmToken = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ error: 'fcmToken is required' });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { fcmToken },
        });

        res.json({ message: 'FCM token registered' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to register FCM token' });
    }
};

export const searchWorkers = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const search = (req.query.search as string) || '';

        const workers = await prisma.worker.findMany({
            where: search
                ? {
                    user: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { phone: { contains: search } },
                        ],
                    },
                }
                : {},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
            take: 50,
        });

        res.json({ workers });
    } catch (error: any) {
        console.error('Search workers error:', error);
        res.status(500).json({ error: 'Failed to search workers' });
    }
};

export const saveEmployerAttendanceReport = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({ where: { userId: req.user.id } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
        if (!entries.length) {
            return res.status(400).json({ error: 'entries array is required' });
        }

        let savedCount = 0;
        const skipped: { jobId: string; workerId: string; reason: string }[] = [];

        for (const entry of entries) {
            const jobId = String(entry?.jobId || '');
            const workerId = String(entry?.workerId || '');
            const status = String(entry?.status || '') as AttendanceStatus;

            if (!jobId || !workerId || !ATTENDANCE_TO_RESERVATION_STATUS[status]) {
                skipped.push({ jobId, workerId, reason: 'Invalid payload' });
                continue;
            }

            const reservations = await prisma.reservation.findMany({
                where: {
                    jobId,
                    workerId,
                    job: { employerId: employer.id },
                },
                select: { id: true },
            });

            if (reservations.length > 0) {
                const updated = await prisma.reservation.updateMany({
                    where: { id: { in: reservations.map(r => r.id) } },
                    data: {
                        status: ATTENDANCE_TO_RESERVATION_STATUS[status],
                    },
                });
                savedCount += updated.count;
            } else {
                skipped.push({ jobId, workerId, reason: 'Reservation not found for this employer' });
            }
        }

        if (savedCount === 0) {
            return res.status(400).json({
                error: 'No attendance records saved',
                skipped,
            });
        }

        res.json({
            message: `Attendance saved for ${savedCount} worker(s)`,
            savedCount,
            skipped,
        });
    } catch (error: any) {
        console.error('Save attendance error:', error);
        res.status(500).json({ error: 'Failed to save attendance report' });
    }
};

export const acceptEmployerJobPayment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;

        const jobId = String(req.params.jobId || '');
        const rawEntries = Array.isArray(req.body?.entries) ? req.body.entries : [];
        if (!jobId) return res.status(400).json({ error: 'jobId is required' });
        if (!rawEntries.length) return res.status(400).json({ error: 'entries array is required' });

        const employer = await prisma.employer.findFirst({ where: { userId } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const job = await prisma.job.findFirst({
            where: { id: jobId, employerId: employer.id },
            select: {
                id: true,
                wagePerDay: true,
            },
        });
        if (!job) return res.status(404).json({ error: 'Job not found for this employer' });

        const statusByWorker = new Map<string, AttendanceStatus>();
        for (const entry of rawEntries) {
            const workerId = String(entry?.workerId || '');
            const status = String(entry?.status || '') as AttendanceStatus;
            if (!workerId || !ATTENDANCE_TO_RESERVATION_STATUS[status]) continue;
            statusByWorker.set(workerId, status);
        }

        if (!statusByWorker.size) {
            return res.status(400).json({ error: 'No valid attendance entries provided' });
        }

        const workerIds = Array.from(statusByWorker.keys());
        const reservationRows = await prisma.reservation.findMany({
            where: {
                jobId,
                workerId: { in: workerIds },
                job: { employerId: employer.id },
            },
            include: {
                worker: { select: { id: true, userId: true } },
            },
        });

        if (!reservationRows.length) {
            return res.status(400).json({ error: 'No matching reservations found for this job' });
        }

        // Persist attendance statuses before processing payments.
        for (const row of reservationRows) {
            const status = statusByWorker.get(row.workerId);
            if (!status) continue;
            await prisma.reservation.update({
                where: { id: row.id },
                data: { status: ATTENDANCE_TO_RESERVATION_STATUS[status] },
            });
        }

        const wagePerDay = Number(job.wagePerDay || 0);
        if (wagePerDay <= 0) return res.status(400).json({ error: 'Invalid job wage' });

        const payouts = reservationRows
            .map((row) => {
                const status = statusByWorker.get(row.workerId);
                if (!status || !PAYABLE_ATTENDANCE.includes(status)) return null;
                return {
                    workerId: row.workerId,
                    workerUserId: row.worker.userId,
                    amount: status === 'HALF' ? wagePerDay / 2 : wagePerDay,
                };
            })
            .filter((item): item is { workerId: string; workerUserId: string; amount: number } => Boolean(item));

        if (!payouts.length) {
            return res.status(400).json({ error: 'No payable workers found (mark PRESENT or HALF first)' });
        }

        const existingPayments = await prisma.payment.findMany({
            where: {
                payerId: userId,
                jobId,
                method: 'attendance_settlement',
                status: 'completed',
                payeeId: { in: payouts.map((p) => p.workerUserId) },
            },
            select: { payeeId: true },
        });
        const paidPayeeIds = new Set(existingPayments.map((p) => p.payeeId));
        const toPay = payouts.filter((p) => !paidPayeeIds.has(p.workerUserId));

        if (!toPay.length) {
            return res.json({
                message: 'Payment already accepted for this job',
                paidWorkers: 0,
                totalPaid: 0,
            });
        }

        const totalAmount = toPay.reduce((sum, p) => sum + p.amount, 0);
        const employerUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        const currentBalance = Number(employerUser?.balance || 0);
        if (currentBalance < totalAmount) {
            return res.status(400).json({
                error: `Insufficient balance. Current: ₹${currentBalance}`,
            });
        }

        await prisma.$transaction(async (tx) => {
            const payer = await tx.user.findUnique({ where: { id: userId }, select: { balance: true } });
            const currentPayerBalance = Number(payer?.balance || 0);

            await tx.user.update({
                where: { id: userId },
                data: { balance: currentPayerBalance - totalAmount },
            });

            for (const p of toPay) {
                const payee = await tx.user.findUnique({ where: { id: p.workerUserId }, select: { balance: true } });
                const currentPayeeBalance = Number(payee?.balance || 0);

                await tx.user.update({
                    where: { id: p.workerUserId },
                    data: { balance: currentPayeeBalance + p.amount },
                });

                await tx.payment.create({
                    data: {
                        jobId,
                        payerId: userId,
                        payeeId: p.workerUserId,
                        amount: p.amount,
                        method: 'attendance_settlement',
                        status: 'completed',
                        confirmedAt: new Date(),
                        idempotencyKey: `attendance_${jobId}_${p.workerId}`,
                    },
                });
            }
        });

        res.json({
            message: `Payment accepted for ${toPay.length} worker(s)`,
            paidWorkers: toPay.length,
            totalPaid: totalAmount,
        });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Payment already processed for one or more workers' });
        }
        console.error('Accept payment error:', error);
        res.status(500).json({ error: 'Failed to accept payment' });
    }
};

export const getEmployerJobsWithWorkers = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({ where: { userId: req.user.id } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const jobs = await prisma.job.findMany({
            where: { employerId: employer.id },
            include: {
                reservations: {
                    where: {
                        status: {
                            notIn: ['CANCELLED', 'EXPIRED', 'REJECTED'],
                        },
                    },
                    include: {
                        worker: {
                            include: {
                                user: {
                                    select: { id: true, name: true, phone: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Flatten into a shape the frontend expects: each job has a `workers` array
        const formatted = jobs.map((job) => ({
            id: job.id,
            title: job.title,
            location: `${job.lat || ''}, ${job.lng || ''}`,
            wagePerDay: Number(job.wagePerDay),
            status: job.status,
            workers: job.reservations.map((r) => ({
                id: r.worker.id,
                name: r.worker.user?.name || 'Worker',
                phone: r.worker.user?.phone || '',
                wage: Number(job.wagePerDay),
                reservationId: r.id,
                reservationStatus: r.status,
                attendanceStatus: RESERVATION_TO_ATTENDANCE_STATUS[r.status] || null,
            })),
        }));

        res.json({ jobs: formatted });
    } catch (error: any) {
        console.error('Get employer jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

// ========== NEW ATTENDANCE REGISTER APIs ==========

// Get workers with their attendance for a date range
export const getEmployerWorkersWithAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({ where: { userId: req.user.id } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        // Get date range from query params (default to last 7 days)
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get all workers who have worked for this employer
        const workers = await prisma.worker.findMany({
            where: {
                reservations: {
                    some: {
                        job: { employerId: employer.id },
                        status: { notIn: ['CANCELLED', 'EXPIRED', 'REJECTED'] },
                    },
                },
            },
            include: {
                user: {
                    select: { id: true, name: true, phone: true },
                },
                attendances: {
                    where: {
                        employerId: employer.id,
                        date: { gte: startDate, lte: endDate },
                    },
                },
                workerDues: {
                    where: { employerId: employer.id },
                },
            },
        });

        // Format response with daily wage info
        const formattedWorkers = workers.map((worker) => ({
            id: worker.id,
            name: worker.user?.name || 'Unknown',
            phone: worker.user?.phone || '',
            wage: Number(worker.expectedWage) || 800,
            dues: worker.workerDues[0]?.balanceDue
                ? Number(worker.workerDues[0].balanceDue)
                : 0,
            totalEarned: worker.workerDues[0]?.totalEarned
                ? Number(worker.workerDues[0].totalEarned)
                : 0,
            totalPaid: worker.workerDues[0]?.totalPaid
                ? Number(worker.workerDues[0].totalPaid)
                : 0,
            attendance: worker.attendances.map((a) => ({
                date: a.date.toISOString().split('T')[0],
                status: a.status,
                wage: Number(a.wage),
                amountPaid: Number(a.amountPaid),
                paymentStatus: a.paymentStatus,
            })),
        }));

        res.json({
            workers: formattedWorkers,
            dateRange: { startDate, endDate },
        });
    } catch (error: any) {
        console.error('Get workers with attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
};

// Mark attendance for a worker on a specific date
export const markWorkerAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({ where: { userId: req.user.id } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const { workerId, date, status, wage, jobId } = req.body;

        if (!workerId || !date || !status) {
            return res.status(400).json({ error: 'workerId, date, and status are required' });
        }

        const attendanceDate = new Date(date);
        const dailyWage = wage ? Number(wage) : 800;

        // Upsert attendance record
        const attendance = await prisma.attendance.upsert({
            where: {
                workerId_date: { workerId, date: attendanceDate },
            },
            update: {
                status,
                wage: dailyWage,
                jobId: jobId || null,
            },
            create: {
                workerId,
                employerId: employer.id,
                date: attendanceDate,
                status,
                wage: dailyWage,
                jobId: jobId || null,
                amountPaid: 0,
                paymentStatus: 'UNPAID',
            },
        });

        // Update worker dues
        await updateWorkerDues(workerId, employer.id);

        res.json({
            message: 'Attendance marked successfully',
            attendance: {
                id: attendance.id,
                date: attendance.date.toISOString().split('T')[0],
                status: attendance.status,
                wage: Number(attendance.wage),
                paymentStatus: attendance.paymentStatus,
            },
        });
    } catch (error: any) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

// Make partial or full payment to a worker
export const payWorker = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({
            where: { userId: req.user.id },
            include: { user: true },
        });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const { workerId, amount, attendanceIds, notes } = req.body;

        if (!workerId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'workerId and valid amount are required' });
        }

        const paymentAmount = Number(amount);

        // Check employer balance
        const currentBalance = Number(employer.user?.balance || 0);
        if (currentBalance < paymentAmount) {
            return res.status(400).json({
                error: `Insufficient balance. Current: ₹${currentBalance}, Required: ₹${paymentAmount}`,
            });
        }

        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
            include: { user: true },
        });
        if (!worker || !worker.user) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        // Process payment
        await prisma.$transaction(async (tx) => {
            // Deduct from employer
            await tx.user.update({
                where: { id: req.user!.id },
                data: { balance: { decrement: paymentAmount } },
            });

            // Add to worker
            await tx.user.update({
                where: { id: worker.userId },
                data: { balance: { increment: paymentAmount } },
            });

            // Create payment record
            await tx.payment.create({
                data: {
                    payerId: req.user!.id,
                    payeeId: worker.userId,
                    amount: paymentAmount,
                    method: 'attendance_settlement',
                    status: 'completed',
                    confirmedAt: new Date(),
                    idempotencyKey: `payment_${workerId}_${Date.now()}`,
                },
            });

            // Update attendance records if specific IDs provided
            if (attendanceIds && attendanceIds.length > 0) {
                let remainingAmount = paymentAmount;
                for (const attId of attendanceIds) {
                    const att = await tx.attendance.findUnique({
                        where: { id: attId },
                    });
                    if (att && remainingAmount > 0) {
                        const wage = Number(att.wage || 0);
                        const currentPaid = Number(att.amountPaid || 0);
                        const toPay = Math.min(wage - currentPaid, remainingAmount);

                        if (toPay > 0) {
                            await tx.attendance.update({
                                where: { id: attId },
                                data: {
                                    amountPaid: { increment: toPay },
                                    paymentStatus:
                                        currentPaid + toPay >= wage ? 'PAID' : 'PARTIAL',
                                },
                            });
                            remainingAmount -= toPay;
                        }
                    }
                }
            }
        });

        // Update dues after payment
        await updateWorkerDues(workerId, employer.id);

        res.json({
            message: `Payment of ₹${paymentAmount} processed successfully`,
            amount: paymentAmount,
            workerId,
        });
    } catch (error: any) {
        console.error('Pay worker error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

// Helper function to update worker dues
async function updateWorkerDues(workerId: string, employerId: string) {
    const attendances = await prisma.attendance.findMany({
        where: { workerId, employerId },
    });

    const totalEarned = attendances.reduce((sum, a) => {
        if (a.status === 'PRESENT') return sum + Number(a.wage || 0);
        if (a.status === 'HALF') return sum + Number(a.wage || 0) / 2;
        return sum;
    }, 0);

    const totalPaid = attendances.reduce((sum, a) => sum + Number(a.amountPaid || 0), 0);
    const balanceDue = totalEarned - totalPaid;

    await prisma.workerDue.upsert({
        where: {
            workerId_employerId: { workerId, employerId },
        },
        update: {
            totalEarned,
            totalPaid,
            balanceDue,
            lastPaymentDate: totalPaid > 0 ? new Date() : undefined,
        },
        create: {
            workerId,
            employerId,
            totalEarned,
            totalPaid,
            balanceDue,
            lastPaymentDate: totalPaid > 0 ? new Date() : undefined,
        },
    });
}

// Get worker's attendance history
export const getWorkerAttendanceHistory = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

        const employer = await prisma.employer.findFirst({ where: { userId: req.user.id } });
        if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

        const { workerId } = req.params;
        if (!workerId) return res.status(400).json({ error: 'workerId is required' });

        const attendances = await prisma.attendance.findMany({
            where: { workerId, employerId: employer.id },
            orderBy: { date: 'desc' },
            include: { job: { select: { title: true } } },
        });

        const workerDues = await prisma.workerDue.findUnique({
            where: { workerId_employerId: { workerId, employerId: employer.id } },
        });

        res.json({
            attendances: attendances.map((a) => ({
                id: a.id,
                date: a.date.toISOString().split('T')[0],
                status: a.status,
                wage: Number(a.wage),
                amountPaid: Number(a.amountPaid),
                paymentStatus: a.paymentStatus,
                jobTitle: a.job?.title || null,
            })),
            summary: {
                totalEarned: workerDues?.totalEarned ? Number(workerDues.totalEarned) : 0,
                totalPaid: workerDues?.totalPaid ? Number(workerDues.totalPaid) : 0,
                balanceDue: workerDues?.balanceDue ? Number(workerDues.balanceDue) : 0,
            },
        });
    } catch (error: any) {
        console.error('Get worker attendance history error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
};
