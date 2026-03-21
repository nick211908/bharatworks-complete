import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { sendJobAlertToWorkers, haversineDistanceKm, JobAlertPayload } from '../services/fcm';
import { callWorkerWithJobAlert } from '../services/ivr';
import { JobService } from '../services/JobService';
import { AppError } from '../middleware/errorHandler';

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) throw new AppError('Unauthorized', 401);

        const employer = await prisma.employer.findFirst({
            where: { userId: req.user.id },
            include: { user: { select: { name: true } } }
        });

        if (!employer) {
            throw new AppError('Only employers can post jobs', 403);
        }

        const { title, count, wagePerDay, lat, lng, geohash, urgent, startTime, endTime, slotsTotal } = req.body;

        const job = await prisma.job.create({
            data: {
                employerId: employer.id,
                title,
                count,
                wagePerDay,
                lat,
                lng,
                geohash,
                urgent,
                status: 'open',
                startTime,
                endTime,
                slotsTotal: slotsTotal || count,
                slotsReserved: 0
            }
        });

        // ─── Proximity Job Alert ──────────────────────────────
        // Fire-and-forget: don't block the response
        if (lat && lng) {
            notifyNearbyWorkers(job.id, title, Number(wagePerDay), lat, lng, !!urgent, employer.companyName || employer.user?.name || 'Employer')
                .catch(err => console.error('[JOB ALERT] Failed to notify workers:', err.message));
        }

        res.status(201).json({ job });
    } catch (error: any) {
        next(error);
    }
};

/**
 * Find active workers within radius.
 * Online workers (fcmToken) -> FCM push notification.
 * Offline workers (no fcmToken but have phone) -> Twilio IVR call.
 */
async function notifyNearbyWorkers(
    jobId: string,
    title: string,
    wagePerDay: number,
    jobLat: number,
    jobLng: number,
    urgent: boolean,
    companyName: string
) {
    const radiusKm = Number(process.env.JOB_ALERT_RADIUS_KM || 10);

    const workers = await prisma.worker.findMany({
        where: {
            // Older records use "online"; some flows used "available".
            availabilityStatus: { in: ['online', 'available'] },
            latitude: { not: null },
            longitude: { not: null },
        },
        include: {
            user: { select: { fcmToken: true, phone: true } }
        }
    });

    const onlineTokens: string[] = [];
    const offlineWorkers: { workerId: string; phone: string; distanceKm: number }[] = [];

    for (const worker of workers) {
        if (!worker.latitude || !worker.longitude) continue;
        const dist = haversineDistanceKm(jobLat, jobLng, worker.latitude, worker.longitude);
        if (dist > radiusKm) continue;

        if (worker.user && worker.user.fcmToken) {
            onlineTokens.push(worker.user.fcmToken);
        } else if (worker.user && worker.user.phone) {
            // Only call offline workers who don't have the app
            offlineWorkers.push({ workerId: worker.id, phone: worker.user.phone, distanceKm: dist });
        }
    }

    const tasks: Promise<any>[] = [];

    // ─── FCM Push (online workers) ────────────────────
    if (onlineTokens.length > 0) {
        const payload: JobAlertPayload = {
            jobId, title, wagePerDay, companyName,
            distanceKm: radiusKm, urgent, lat: jobLat, lng: jobLng,
        };
        tasks.push(
            sendJobAlertToWorkers(onlineTokens, payload)
                .then(n => console.log(`[JOB ALERT] FCM sent to ${n} online workers`))
        );
    }

    // ─── IVR Calls (offline workers) ──────────────────
    if (offlineWorkers.length > 0) {
        console.log(`[JOB ALERT] Initiating IVR calls to ${offlineWorkers.length} offline workers`);
        for (const w of offlineWorkers) {
            tasks.push(
                callWorkerWithJobAlert(w.phone, {
                    jobId, title, wagePerDay, companyName,
                    distanceKm: w.distanceKm, urgent, workerId: w.workerId,
                })
            );
        }
    }

    if (tasks.length === 0) {
        console.log(`[JOB ALERT] No nearby available workers found within ${radiusKm} km`);
        return;
    }

    await Promise.allSettled(tasks);
    console.log(`[JOB ALERT] Notified ${onlineTokens.length} online + ${offlineWorkers.length} offline workers`);
}


export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status, limit } = req.query;
        const queryCondition: any = {};
        if (status) queryCondition.status = status;

        const jobs = await prisma.job.findMany({
            where: queryCondition,
            include: {
                employer: {
                    include: {
                        user: {
                            select: { name: true, phone: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            ...(limit ? { take: parseInt(limit as string) } : {}),
        });

        res.json({ jobs });
    } catch (error: any) {
        next(error);
    }
};

export const getJobById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !id) {
            throw new AppError('Invalid job id', 400);
        }

        const job = await JobService.getJobById(id);

        if (!job) throw new AppError('Job not found', 404);
        res.json({ job });
    } catch (error: any) {
        next(error);
    }
};

export const getNearbyJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { lat, lng, radius } = req.query;
        if (!lat || !lng) throw new AppError('lat and lng are required', 400);

        const jobLat = parseFloat(lat as string);
        const jobLng = parseFloat(lng as string);
        const radiusKm = parseFloat((radius as string) || String(process.env.JOB_ALERT_RADIUS_KM || '10'));

        const nearby = await JobService.getNearbyJobs(jobLat, jobLng, radiusKm);

        res.json({ jobs: nearby });
    } catch (error: any) {
        next(error);
    }
};

export const applyForJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) throw new AppError('Unauthorized', 401);

        const jobId = req.params.id as string;

        const worker = await prisma.worker.findFirst({ where: { userId: req.user.id } });
        if (!worker) throw new AppError('Worker profile not found. Please complete your profile first.', 404);

        try {
            const reservation = await JobService.applyToJobTransaction(jobId, worker.id);
            res.status(201).json({ reservation, message: 'Successfully applied for job!' });
        } catch (e: any) {
            throw new AppError(e.message, 400);
        }

    } catch (error: any) {
        next(error);
    }
};
