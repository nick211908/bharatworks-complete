import * as admin from 'firebase-admin';

// Initialize only once
if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (process.env.FIREBASE_PROJECT_ID && privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
        console.log('[FCM] Firebase Admin initialized');
    } else {
        console.warn('[FCM] Firebase credentials not set — running in mock mode');
    }
}

const isMock = !admin.apps.length;

export interface JobAlertPayload {
    jobId: string;
    title: string;
    wagePerDay: number;
    companyName: string;
    distanceKm: number;
    urgent: boolean;
    lat: number;
    lng: number;
}

/**
 * Send job alert notification to a list of FCM device tokens.
 * Falls back to console.log in dev/mock mode.
 */
export const sendJobAlertToWorkers = async (
    tokens: string[],
    job: JobAlertPayload
): Promise<number> => {
    if (!tokens.length) return 0;

    if (isMock) {
        console.log(`\n[MOCK FCM] Would alert ${tokens.length} worker(s) about job: "${job.title}" (₹${job.wagePerDay}/day)`);
        return tokens.length;
    }

    const message: admin.messaging.MulticastMessage = {
        tokens,
        data: {
            type: 'JOB_ALERT',
            jobId: job.jobId,
            title: job.title,
            wagePerDay: String(job.wagePerDay),
            companyName: job.companyName,
            distanceKm: String(job.distanceKm.toFixed(1)),
            urgent: String(job.urgent),
            lat: String(job.lat),
            lng: String(job.lng),
        },
        notification: {
            title: job.urgent ? `🚨 Urgent Job Alert!` : `💼 New Job Near You`,
            body: `${job.title} — ₹${job.wagePerDay}/day • ${job.distanceKm.toFixed(1)} km away`,
        },
        android: {
            priority: 'high',
            notification: {
                channelId: 'job_alerts',
                priority: 'max',
                defaultSound: true,
                defaultVibrateTimings: true,
            },
        },
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent job alert to ${response.successCount}/${tokens.length} workers (${response.failureCount} failed)`);
        return response.successCount;
    } catch (err: any) {
        console.error('[FCM] Send failed:', err.message);
        return 0;
    }
};

/**
 * Haversine distance in km between two lat/lng points.
 */
export const haversineDistanceKm = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
