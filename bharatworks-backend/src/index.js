"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load .env BEFORE any other imports that reference process.env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const users_1 = __importDefault(require("./routes/users"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const payment_1 = __importDefault(require("./routes/payment"));
const ivr_1 = __importDefault(require("./routes/ivr"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
// Middleware
app.use((0, cors_1.default)());
// Razorpay webhook needs raw body — BEFORE express.json()
app.use('/api/payment/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/jobs', jobs_1.default);
app.use('/api/users', users_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/payment', payment_1.default);
app.use('/api/ivr', ivr_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
app.listen(Number(PORT), HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
//# sourceMappingURL=index.js.map