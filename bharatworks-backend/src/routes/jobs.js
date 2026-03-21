"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobs_1 = require("../controllers/jobs");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticateToken, jobs_1.createJob);
router.get('/', auth_1.authenticateToken, jobs_1.getJobs);
router.get('/nearby', auth_1.authenticateToken, jobs_1.getNearbyJobs);
router.get('/:id', auth_1.authenticateToken, jobs_1.getJobById);
router.post('/:id/apply', auth_1.authenticateToken, jobs_1.applyForJob);
exports.default = router;
//# sourceMappingURL=jobs.js.map