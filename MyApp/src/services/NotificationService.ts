import api from './api';

export const NotificationService = {
    /**
     * Subscribe to new notifications for a specific user.
     * Web sockets not implemented in Phase 1 express MVP.
     */
    subscribeToNotifications(userId: string, onNotification: (payload: any) => void) {
        console.warn("Websockets not supported in Node backend MVP. Notifications won't be live.");
        return () => { };
    },

    async fetchNotifications(userId: string) {
        try {
            const response = await api.get('/notifications');
            return response.data.notifications;
        } catch (error) {
            throw error;
        }
    },

    async markAsRead(notificationId: string) {
        try {
            await api.post('/notifications/read', { id: notificationId });
        } catch (error) {
            throw error;
        }
    }
};
