import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prisma';
import { sendSmsOtp } from '../services/sms';
import { sendOtpEmail, sendWelcomeEmail } from '../services/email';
import { AuthRequest } from '../middleware/auth';

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing")
}
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Dev Mode Config ─────────────────────────────────────────────
const DEV_MODE = process.env.NODE_ENV !== 'production';
const DEV_OTP = '123456';
const DEV_NUMBERS = ['+919999900001', '+919999900002', '+919999900003'];

const generateOtp = (phone?: string) =>
    (DEV_MODE || (phone && DEV_NUMBERS.includes(phone))) ? DEV_OTP : Math.floor(100000 + Math.random() * 900000).toString();

// ─── Store OTP in DB ─────────────────────────────────────────────

const saveOtp = async (identifier: string, type: 'phone' | 'email', otp: string) => {
    // Invalidate any existing unused OTPs for this identifier and create new one atomically
    await prisma.$transaction([
        type === 'phone'
            ? prisma.otpLog.updateMany({
                  where: { phone: identifier, used: false },
                  data: { used: true },
              })
            : prisma.otpLog.updateMany({
                  where: { email: identifier, used: false },
                  data: { used: true },
              }),
        prisma.otpLog.create({
            data: {
                phone: type === 'phone' ? identifier : null,
                email: type === 'email' ? identifier : null,
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
            },
        }),
    ]);
};

const verifyStoredOtp = async (
    identifier: string,
    type: 'phone' | 'email',
    otp: string
): Promise<{ valid: boolean; error?: string }> => {
    const where = type === 'phone' ? { phone: identifier } : { email: identifier };

    const record = await prisma.otpLog.findFirst({
        where: { ...where, used: false },
        orderBy: { createdAt: 'desc' },
    });

    if (!record) return { valid: false, error: 'No OTP requested for this identifier' };
    if (new Date() > record.expiresAt) {
        await prisma.otpLog.update({ where: { id: record.id }, data: { used: true } });
        return { valid: false, error: 'OTP has expired' };
    }
    if (record.otp !== otp) return { valid: false, error: 'Invalid OTP' };

    // Mark as used
    await prisma.otpLog.update({ where: { id: record.id }, data: { used: true } });
    return { valid: true };
};

// ─── Controllers ─────────────────────────────────────────────────

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, phone, password, name, role } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ phone }, { email: email || undefined }] },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                phone,
                email,
                name,
                password: hashedPassword,
                roles: role ? [role] : [],
            },
        });

        const token = jwt.sign(
            { id: user.id, phone: user.phone, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Send welcome email (non-blocking)
        if (email) {
            sendWelcomeEmail(email, name || '').catch((err) =>
                console.error('[EMAIL ERROR] Welcome email failed:', err.message)
            );
        }

        res.status(201).json({ user, token });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, phone, password } = req.body;

        if (!password || (!email && !phone)) {
            return res.status(400).json({ error: 'Email/phone and password are required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: phone ? [{ phone }] : [{ email }],
            },
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ user, token });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
};

export const getUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.user!;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { workers: true }
        });
        if (user) delete (user as any).password;
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to get user' });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.user!;
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};

// ─── OTP (Phone) ─────────────────────────────────────────────────

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number is required' });

        const otp = generateOtp(phone);
        await saveOtp(phone, 'phone', otp);
        await sendSmsOtp(phone, otp);

        // In dev mode, return the OTP in the response so the app can auto-fill
        const response: any = { message: 'OTP sent successfully' };
        if (DEV_MODE) {
            console.log(`[DEV MODE] OTP for ${phone} is: ${otp}`);
            response.devOtp = otp;
        }
        res.json(response);
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp, role } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }

        const result = await verifyStoredOtp(phone, 'phone', otp);
        if (!result.valid) {
            return res.status(400).json({ error: result.error });
        }

        let user = await prisma.user.findFirst({ where: { phone } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    roles: role ? [role] : ['worker'],
                },
            });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ user, session: { access_token: token } });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};

// ─── OTP (Email) ─────────────────────────────────────────────────

export const sendEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const otp = generateOtp();
        await saveOtp(email, 'email', otp);
        await sendOtpEmail(email, otp);

        const response: any = { message: 'OTP sent to email' };
        if (DEV_MODE) {
            console.log(`[DEV MODE] Email OTP for ${email} is: ${otp}`);
            response.devOtp = otp;
        }
        res.json(response);
    } catch (error: any) {
        console.error('Send Email OTP error:', error);
        res.status(500).json({ error: 'Failed to send email OTP' });
    }
};

export const verifyEmailOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp, role } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const result = await verifyStoredOtp(email, 'email', otp);
        if (!result.valid) {
            return res.status(400).json({ error: result.error });
        }

        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone: `uid_${crypto.randomUUID().slice(0, 12)}`,
                    email,
                    roles: role ? [role] : ['worker'],
                },
            });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ user, session: { access_token: token } });
    } catch (error: any) {
        console.error('Verify Email OTP error:', error);
        res.status(500).json({ error: 'Failed to verify email OTP' });
    }
};
