"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = require("../controllers/users");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/employer', auth_1.authenticateToken, users_1.createEmployerProfile);
router.post('/worker', auth_1.authenticateToken, users_1.createWorkerProfile);
router.put('/worker/location', auth_1.authenticateToken, users_1.updateWorkerLocation);
router.patch('/profile', auth_1.authenticateToken, users_1.updateUserProfile);
router.post('/agent', auth_1.authenticateToken, users_1.createAgentProfile);
router.get('/agent/profile', auth_1.authenticateToken, users_1.getAgentProfile);
router.put('/fcm-token', auth_1.authenticateToken, users_1.registerFcmToken);
exports.default = router;
//# sourceMappingURL=users.js.map