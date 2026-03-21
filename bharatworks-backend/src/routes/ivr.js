"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ivr_1 = require("../controllers/ivr");
const router = express_1.default.Router();
// Twilio fetches this to get call instructions (TwiML)
router.get('/twiml', ivr_1.ivrTwiml);
// Twilio posts keypress result here
router.post('/response', express_1.default.urlencoded({ extended: false }), ivr_1.ivrResponse);
// Twilio posts call status updates here
router.post('/status', express_1.default.urlencoded({ extended: false }), ivr_1.ivrStatus);
exports.default = router;
//# sourceMappingURL=ivr.js.map