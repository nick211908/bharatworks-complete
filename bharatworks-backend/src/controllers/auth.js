"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailOtp = exports.sendEmailOtp = exports.verifyOtp = exports.sendOtp = exports.updatePassword = exports.getUser = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const sms_1 = require("../services/sms");
const email_1 = require("../services/email");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
// ─── Dev Mode Config ─────────────────────────────────────────────
const DEV_MODE = process.env.NODE_ENV !== 'production';
const DEV_OTP = '123456';
const DEV_NUMBERS = ['+919999900001', '+919999900002', '+919999900003'];
const generateOtp = (phone) => (DEV_MODE || (phone && DEV_NUMBERS.includes(phone))) ? DEV_OTP : Math.floor(100000 + Math.random() * 900000).toString();
// ─── Store OTP in DB ─────────────────────────────────────────────
const saveOtp = async (identifier, type, otp) => {
    // Invalidate any existing unused OTPs for this identifier
    if (type === 'phone') {
        await prisma_1.default.otpLog.updateMany({
            where: { phone: identifier, used: false },
            data: { used: true },
        });
    }
    else {
        await prisma_1.default.otpLog.updateMany({
            where: { email: identifier, used: false },
            data: { used: true },
        });
    }
    await prisma_1.default.otpLog.create({
        data: {
            phone: type === 'phone' ? identifier : null,
            email: type === 'email' ? identifier : null,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        },
    });
};
const verifyStoredOtp = async (identifier, type, otp) => {
    const where = type === 'phone' ? { phone: identifier } : { email: identifier };
    const record = await prisma_1.default.otpLog.findFirst({
        where: { ...where, used: false },
        orderBy: { createdAt: 'desc' },
    });
    if (!record)
        return { valid: false, error: 'No OTP requested for this identifier' };
    if (new Date() > record.expiresAt) {
        await prisma_1.default.otpLog.update({ where: { id: record.id }, data: { used: true } });
        return { valid: false, error: 'OTP has expired' };
    }
    if (record.otp !== otp)
        return { valid: false, error: 'Invalid OTP' };
    // Mark as used
    await prisma_1.default.otpLog.update({ where: { id: record.id }, data: { used: true } });
    return { valid: true };
};
// ─── Controllers ─────────────────────────────────────────────────
const signup = async (req, res) => {
    try {
        const { email, phone, password, name, role } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }
        const existingUser = await prisma_1.default.user.findFirst({
            where: { OR: [{ phone }, { email: email || undefined }] },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone or email already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                phone,
                email,
                name,
                password: hashedPassword,
                roles: role ? [role] : [],
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '30d' });
        // Send welcome email (non-blocking)
        if (email) {
            (0, email_1.sendWelcomeEmail)(email, name || '').catch((err) => console.error('[EMAIL ERROR] Welcome email failed:', err.message));
        }
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if (!password || (!email && !phone)) {
            return res.status(400).json({ error: 'Email/phone and password are required' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: phone ? [{ phone }] : [{ email }],
            },
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ user, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
};
exports.login = login;
const getUser = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            include: { workers: true },
            omit: { password: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
};
exports.getUser = getUser;
const updatePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma_1.default.user.update({ where: { id }, data: { password: hashedPassword } });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};
exports.updatePassword = updatePassword;
// ─── OTP (Phone) ─────────────────────────────────────────────────
const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ error: 'Phone number is required' });
        const otp = generateOtp(phone);
        await saveOtp(phone, 'phone', otp);
        await (0, sms_1.sendSmsOtp)(phone, otp);
        // In dev mode, return the OTP in the response so the app can auto-fill
        const response = { message: 'OTP sent successfully' };
        if (DEV_MODE) {
            console.log(`[DEV MODE] OTP for ${phone} is: ${otp}`);
            response.devOtp = otp;
        }
        res.json(response);
    }
    catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { phone, otp, role } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }
        const result = await verifyStoredOtp(phone, 'phone', otp);
        if (!result.valid) {
            return res.status(400).json({ error: result.error });
        }
        let user = await prisma_1.default.user.findFirst({ where: { phone } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    phone,
                    roles: role ? [role] : ['worker'],
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ user, session: { access_token: token } });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};
exports.verifyOtp = verifyOtp;
// ─── OTP (Email) ─────────────────────────────────────────────────
const sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: 'Email is required' });
        const otp = generateOtp();
        await saveOtp(email, 'email', otp);
        await (0, email_1.sendOtpEmail)(email, otp);
        const response = { message: 'OTP sent to email' };
        if (DEV_MODE) {
            console.log(`[DEV MODE] Email OTP for ${email} is: ${otp}`);
            response.devOtp = otp;
        }
        res.json(response);
    }
    catch (error) {
        console.error('Send Email OTP error:', error);
        res.status(500).json({ error: 'Failed to send email OTP' });
    }
};
exports.sendEmailOtp = sendEmailOtp;
const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp, role } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        const result = await verifyStoredOtp(email, 'email', otp);
        if (!result.valid) {
            return res.status(400).json({ error: result.error });
        }
        let user = await prisma_1.default.user.findFirst({ where: { email } });
        if (!user) {
            user = await prisma_1.default.user.create({
                data: {
                    phone: `email_${Date.now()}`, // placeholder — phone is required in schema
                    email,
                    roles: role ? [role] : ['worker'],
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ user, session: { access_token: token } });
    }
    catch (error) {
        console.error('Verify Email OTP error:', error);
        res.status(500).json({ error: 'Failed to verify email OTP' });
    }
};
exports.verifyEmailOtp = verifyEmailOtp;
//# sourceMappingURL=auth.js.map