"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForJob = exports.getNearbyJobs = exports.getJobById = exports.getJobs = exports.createJob = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const fcm_1 = require("../services/fcm");
const ivr_1 = require("../services/ivr");
const createJob = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const employer = await prisma_1.default.employer.findFirst({
            where: { userId: req.user.id },
            include: { user: { select: { name: true } } }
        });
        if (!employer) {
            return res.status(403).json({ error: 'Only employers can post jobs' });
        }
        const { title, count, wagePerDay, lat, lng, geohash, urgent, startTime, endTime, slotsTotal } = req.body;
        const job = await prisma_1.default.job.create({
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
    }
    catch (error) {
        console.error('Job creation error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};
exports.createJob = createJob;
/**
 * Find available workers within radius.
 * Online workers (fcmToken) → FCM push notification.
 * Offline workers (no fcmToken but have phone) → Twilio IVR call.
 */
async function notifyNearbyWorkers(jobId, title, wagePerDay, jobLat, jobLng, urgent, companyName) {
    const radiusKm = Number(process.env.JOB_ALERT_RADIUS_KM || 10);
    const workers = await prisma_1.default.worker.findMany({
        where: {
            availabilityStatus: 'available',
            latitude: { not: null },
            longitude: { not: null },
        },
        include: {
            user: { select: { fcmToken: true, phone: true } }
        }
    });
    const onlineTokens = [];
    const offlineWorkers = [];
    for (const worker of workers) {
        if (!worker.latitude || !worker.longitude)
            continue;
        const dist = (0, fcm_1.haversineDistanceKm)(jobLat, jobLng, worker.latitude, worker.longitude);
        if (dist > radiusKm)
            continue;
        if (worker.user && worker.user.fcmToken) {
            onlineTokens.push(worker.user.fcmToken);
        }
        else if (worker.user && worker.user.phone) {
            // Only call offline workers who don't have the app
            offlineWorkers.push({ workerId: worker.id, phone: worker.user.phone, distanceKm: dist });
        }
    }
    const tasks = [];
    // ─── FCM Push (online workers) ────────────────────
    if (onlineTokens.length > 0) {
        const payload = {
            jobId, title, wagePerDay, companyName,
            distanceKm: radiusKm, urgent, lat: jobLat, lng: jobLng,
        };
        tasks.push((0, fcm_1.sendJobAlertToWorkers)(onlineTokens, payload)
            .then(n => console.log(`[JOB ALERT] FCM sent to ${n} online workers`)));
    }
    // ─── IVR Calls (offline workers) ──────────────────
    if (offlineWorkers.length > 0) {
        console.log(`[JOB ALERT] Initiating IVR calls to ${offlineWorkers.length} offline workers`);
        for (const w of offlineWorkers) {
            tasks.push((0, ivr_1.callWorkerWithJobAlert)(w.phone, {
                jobId, title, wagePerDay, companyName,
                distanceKm: w.distanceKm, urgent, workerId: w.workerId,
            }));
        }
    }
    if (tasks.length === 0) {
        console.log(`[JOB ALERT] No nearby available workers found within ${radiusKm} km`);
        return;
    }
    await Promise.allSettled(tasks);
    console.log(`[JOB ALERT] Notified ${onlineTokens.length} online + ${offlineWorkers.length} offline workers`);
}
const getJobs = async (req, res) => {
    try {
        const { status, limit } = req.query;
        const queryCondition = {};
        if (status)
            queryCondition.status = status;
        const jobs = await prisma_1.default.job.findMany({
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
            ...(limit ? { take: parseInt(limit) } : {}),
        });
        res.json({ jobs });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !id) {
            return res.status(400).json({ error: 'Invalid job id' });
        }
        const job = await prisma_1.default.job.findUnique({
            where: { id },
            include: {
                employer: {
                    include: {
                        user: {
                            select: { name: true, phone: true }
                        }
                    }
                }
            }
        });
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        res.json({ job });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch job details' });
    }
};
exports.getJobById = getJobById;
const getNearbyJobs = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        if (!lat || !lng)
            return res.status(400).json({ error: 'lat and lng are required' });
        const jobLat = parseFloat(lat);
        const jobLng = parseFloat(lng);
        const radiusKm = parseFloat(radius || String(process.env.JOB_ALERT_RADIUS_KM || '10'));
        const jobs = await prisma_1.default.job.findMany({
            where: { status: 'open', lat: { not: null }, lng: { not: null } },
            include: {
                employer: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        const nearby = jobs
            .map(j => ({
            ...j,
            distanceKm: (0, fcm_1.haversineDistanceKm)(jobLat, jobLng, j.lat, j.lng),
        }))
            .filter(j => j.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);
        res.json({ jobs: nearby });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch nearby jobs' });
    }
};
exports.getNearbyJobs = getNearbyJobs;
const applyForJob = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        const jobId = req.params.id;
        const worker = await prisma_1.default.worker.findFirst({ where: { userId: req.user.id } });
        if (!worker)
            return res.status(404).json({ error: 'Worker profile not found. Please complete your profile first.' });
        const job = await prisma_1.default.job.findUnique({ where: { id: jobId } });
        if (!job)
            return res.status(404).json({ error: 'Job not found' });
        if (job.status !== 'open')
            return res.status(400).json({ error: 'Job is no longer accepting applications' });
        if (job.slotsReserved >= job.slotsTotal)
            return res.status(400).json({ error: 'Job is fully booked' });
        const existingReservation = await prisma_1.default.reservation.findFirst({
            where: { jobId, workerId: worker.id }
        });
        if (existingReservation)
            return res.status(400).json({ error: 'You have already applied for this job' });
        const reservation = await prisma_1.default.reservation.create({
            data: {
                jobId,
                workerId: worker.id,
                status: 'CONFIRMED',
                checkinMethods: ['manual'],
                idempotencyKey: `${worker.id}-${jobId}-${Date.now()}`
            }
        });
        await prisma_1.default.job.update({
            where: { id: jobId },
            data: { slotsReserved: { increment: 1 } }
        });
        res.status(201).json({ reservation, message: 'Successfully applied for job!' });
    }
    catch (error) {
        console.error('Job apply error:', error);
        res.status(500).json({ error: 'Failed to apply for job' });
    }
};
exports.applyForJob = applyForJob;
//# sourceMappingURL=jobs.js.map