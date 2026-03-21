"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/signup', auth_1.signup);
router.post('/login', auth_1.login);
// Phone OTP
router.post('/send-otp', auth_1.sendOtp);
router.post('/verify-otp', auth_1.verifyOtp);
// Email OTP
router.post('/send-email-otp', auth_1.sendEmailOtp);
router.post('/verify-email-otp', auth_1.verifyEmailOtp);
// Authenticated
router.get('/me', auth_2.authenticateToken, auth_1.getUser);
router.post('/update-password', auth_2.authenticateToken, auth_1.updatePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map