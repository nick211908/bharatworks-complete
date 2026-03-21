import twilio from 'twilio';
import logger from '../utils/logger';

const isDev = !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxx');

let client: ReturnType<typeof twilio> | null = null;

if (!isDev) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Sends an OTP via SMS.
 * In development (no Twilio credentials), logs to console instead.
 */
export const sendSmsOtp = async (phone: string, otp: string): Promise<void> => {
    if (isDev || !client) {
        logger.debug(`[MOCK SMS] OTP for ${phone} is: ${otp}`);
        return;
    }

    await client.messages.create({
        body: `Your BharatWork OTP is: ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phone,
    });
};

/**
 * Sends a generic SMS notification.
 */
export const sendSms = async (phone: string, message: string): Promise<void> => {
    if (isDev || !client) {
        logger.debug(`[MOCK SMS] To ${phone}: ${message}`);
        return;
    }

    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phone,
    });
};
