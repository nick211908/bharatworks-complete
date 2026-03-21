"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJobNotificationEmail = exports.sendPaymentReceiptEmail = exports.sendWelcomeEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const isDev = !process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com';
const transporter = nodemailer_1.default.createTransport(isDev
    ? { jsonTransport: true } // dev: no real email, bypass strict types
    : {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
const FROM = process.env.EMAIL_FROM || 'BharatWork <noreply@bharatwork.in>';
const sendEmail = async (to, subject, html) => {
    if (isDev) {
        console.log(`\n[MOCK EMAIL] To: ${to} | Subject: ${subject}\n`);
        return;
    }
    await transporter.sendMail({ from: FROM, to, subject, html });
};
// ─── Templates ────────────────────────────────────────────────────
const sendOtpEmail = async (to, otp) => {
    await sendEmail(to, 'Your BharatWork OTP', `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#FF9F1C;margin-bottom:8px">BharatWork</h2>
          <p style="color:#444">Your one-time password is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#3F5BD9;margin:24px 0">${otp}</div>
          <p style="color:#888;font-size:13px">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        `);
};
exports.sendOtpEmail = sendOtpEmail;
const sendWelcomeEmail = async (to, name) => {
    await sendEmail(to, 'Welcome to BharatWork!', `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#FF9F1C">Welcome, ${name || 'there'}! 🎉</h2>
          <p style="color:#444">Your BharatWork account has been created successfully.</p>
          <p style="color:#444">Start posting jobs or finding workers today!</p>
          <a href="https://bharatwork.in" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#FF9F1C;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Get Started</a>
        </div>
        `);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPaymentReceiptEmail = async (to, name, amount, txnId, type) => {
    const isTopup = type === 'topup';
    await sendEmail(to, isTopup ? `₹${amount} added to your BharatWork Wallet` : `₹${amount} payout initiated`, `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#3F5BD9">${isTopup ? '💰 Wallet Top-Up Successful' : '🏦 Payout Initiated'}</h2>
          <p style="color:#444">Hi ${name || 'there'},</p>
          <p style="color:#444">${isTopup ? `₹${amount} has been added to your wallet.` : `Your payout of ₹${amount} has been initiated.`}</p>
          <table style="width:100%;margin-top:16px;border-collapse:collapse">
            <tr><td style="color:#888;padding:8px 0">Amount</td><td style="font-weight:600;color:#333">₹${amount}</td></tr>
            <tr><td style="color:#888;padding:8px 0">Transaction ID</td><td style="font-family:monospace;color:#3F5BD9">${txnId}</td></tr>
            <tr><td style="color:#888;padding:8px 0">Status</td><td style="color:#22c55e;font-weight:600">${isTopup ? 'Completed' : 'Processing'}</td></tr>
          </table>
        </div>
        `);
};
exports.sendPaymentReceiptEmail = sendPaymentReceiptEmail;
const sendJobNotificationEmail = async (to, name, jobTitle, message) => {
    await sendEmail(to, `Job Update: ${jobTitle}`, `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#FF9F1C">Job Update 📋</h2>
          <p style="color:#444">Hi ${name || 'there'},</p>
          <p style="color:#444">${message}</p>
          <p style="color:#888;font-size:12px;margin-top:24px">— The BharatWork Team</p>
        </div>
        `);
};
exports.sendJobNotificationEmail = sendJobNotificationEmail;
//# sourceMappingURL=email.js.map