"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = void 0;
// Basic mock notification controller.
// Expand this once a Notifications table is added to schema.prisma
const getNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        res.json({ notifications: [] });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user.id)
            return res.status(401).json({ error: 'Unauthorized' });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=notifications.js.map