import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Basic mock notification controller.
// Expand this once a Notifications table is added to schema.prisma
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        res.json({ notifications: [] });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
}
