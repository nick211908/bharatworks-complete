"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineDistanceKm = exports.sendJobAlertToWorkers = void 0;
const admin = __importStar(require("firebase-admin"));
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
    }
    else {
        console.warn('[FCM] Firebase credentials not set — running in mock mode');
    }
}
const isMock = !admin.apps.length;
/**
 * Send job alert notification to a list of FCM device tokens.
 * Falls back to console.log in dev/mock mode.
 */
const sendJobAlertToWorkers = async (tokens, job) => {
    if (!tokens.length)
        return 0;
    if (isMock) {
        console.log(`\n[MOCK FCM] Would alert ${tokens.length} worker(s) about job: "${job.title}" (₹${job.wagePerDay}/day)`);
        return tokens.length;
    }
    const message = {
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
    }
    catch (err) {
        console.error('[FCM] Send failed:', err.message);
        return 0;
    }
};
exports.sendJobAlertToWorkers = sendJobAlertToWorkers;
/**
 * Haversine distance in km between two lat/lng points.
 */
const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
exports.haversineDistanceKm = haversineDistanceKm;
//# sourceMappingURL=fcm.js.map