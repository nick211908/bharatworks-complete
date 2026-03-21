"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = exports.sendSmsOtp = void 0;
const twilio_1 = __importDefault(require("twilio"));
const isDev = !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxx');
let client = null;
if (!isDev) {
    client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
/**
 * Sends an OTP via SMS.
 * In development (no Twilio credentials), logs to console instead.
 */
const sendSmsOtp = async (phone, otp) => {
    if (isDev || !client) {
        console.log(`\n🔑 [DEV MODE - MOCK SMS] OTP for ${phone} is: ${otp}\n`);
        return;
    }
    await client.messages.create({
        body: `Your BharatWork OTP is: ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
};
exports.sendSmsOtp = sendSmsOtp;
/**
 * Sends a generic SMS notification.
 */
const sendSms = async (phone, message) => {
    if (isDev || !client) {
        console.log(`\n[MOCK SMS] To ${phone}: ${message}\n`);
        return;
    }
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
};
exports.sendSms = sendSms;
//# sourceMappingURL=sms.js.map