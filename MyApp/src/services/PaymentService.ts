import api from './api';

/**
 * Payment Service
 * Handles UPI verification via the backend Razorpay integration.
 */
export const PaymentService = {

    /**
     * Validates if the UPI ID string follows the correct format.
     * Format: username@bank
     */
    validateUpiFormat(upiId: string): boolean {
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        return upiRegex.test(upiId);
    },

    /**
     * Verifies the UPI ID against Razorpay via the backend.
     */
    async verifyUpiId(upiId: string): Promise<{ isValid: boolean; name?: string; message?: string }> {
        // 1. Local format validation
        if (!this.validateUpiFormat(upiId)) {
            return { isValid: false, message: "Invalid UPI ID Format (e.g. user@bank)" };
        }

        // 2. Call backend for real Razorpay VPA verification
        try {
            const response = await api.post('/payment/verify-vpa', { upiId });
            return response.data;
        } catch (error: any) {
            console.error('UPI verification error:', error.message);
            // If backend is unreachable, fallback to format-only validation
            if (!error.response) {
                return {
                    isValid: true,
                    name: upiId.split('@')[0] + ' (Offline - Verify Later)',
                    message: 'Could not reach server for verification',
                };
            }
            return error.response?.data || { isValid: false, message: 'Verification failed' };
        }
    },
};
