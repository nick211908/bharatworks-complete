import prisma from '../prisma';
import { haversineDistanceKm } from './fcm';

export class JobService {
    static async getJobById(jobId: string) {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
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
        return job;
    }

    static async getNearbyJobs(lat: number, lng: number, radiusKm: number) {
        const jobs = await prisma.job.findMany({
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
                distanceKm: haversineDistanceKm(lat, lng, j.lat!, j.lng!),
            }))
            .filter(j => j.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);

        return nearby;
    }

    static async applyToJobTransaction(jobId: string, workerId: string) {
        return prisma.$transaction(async (tx) => {
            const job = await tx.job.findUnique({ where: { id: jobId } });
            if (!job) throw new Error('Job not found');
            if (job.status !== 'open') throw new Error('Job is no longer accepting applications');
            if (job.slotsReserved >= job.slotsTotal) throw new Error('Job is fully booked');

            const existingReservation = await tx.reservation.findFirst({
                where: { jobId, workerId }
            });
            if (existingReservation) throw new Error('You have already applied for this job');

            const reservation = await tx.reservation.create({
                data: {
                    jobId,
                    workerId,
                    status: 'CONFIRMED',
                    checkinMethods: ['manual'],
                    idempotencyKey: `${workerId}-${jobId}-${Date.now()}`
                }
            });

            await tx.job.update({
                where: { id: jobId },
                data: { slotsReserved: { increment: 1 } }
            });

            return reservation;
        });
    }
}
