"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_1 = require("../controllers/wallet");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/balance', auth_1.authenticateToken, wallet_1.getBalance);
router.post('/topup', auth_1.authenticateToken, wallet_1.topUpWallet);
router.post('/payout-request', auth_1.authenticateToken, wallet_1.requestPayout);
exports.default = router;
//# sourceMappingURL=wallet.js.map