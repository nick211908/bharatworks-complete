"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ivrStatus = exports.ivrResponse = exports.ivrTwiml = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const ivr_1 = require("../services/ivr");
const sms_1 = require("../services/sms");
/**
 * GET /api/ivr/twiml
 * Twilio fetches this URL when placing the call.
 * Returns TwiML XML to read out job details and gather keypress.
 */
const ivrTwiml = (req, res) => {
    const { jobId, workerId, title, wage, dist, company, urgent } = req.query;
    if (!jobId || !workerId) {
        return res.status(400).type('text/xml').send(`
            <?xml version="1.0" encoding="UTF-8"?>
            <Response><Say>Invalid request. Goodbye.</Say></Response>
        `);
    }
    const twiml = (0, ivr_1.buildJobAlertTwiml)(jobId, workerId, title || 'Job', wage || '0', dist || '0', company || 'Employer', urgent === 'true');
    res.type('text/xml').send(twiml);
};
exports.ivrTwiml = ivrTwiml;
/**
 * POST /api/ivr/response
 * Twilio posts here with worker's keypress digit.
 * 1 = Accept, 2 = Decline
 */
const ivrResponse = async (req, res) => {
    const jobId = req.query.jobId;
    const workerId = req.query.workerId;
    const digit = req.body?.Digits;
    console.log(`[IVR] Response — Job: ${jobId} | Worker: ${workerId} | Key: ${digit}`);
    let twimlReply;
    if (!jobId || !workerId) {
        res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Invalid request. Goodbye.</Say></Response>`);
        return;
    }
    if (digit === '1') {
        // Worker accepted — apply for the job
        try {
            const worker = await prisma_1.default.worker.findFirst({
                where: { id: workerId },
                include: { user: { select: { phone: true, name: true } } }
            });
            const job = await prisma_1.default.job.findUnique({ where: { id: jobId } });
            if (worker && job && job.status === 'open' && job.slotsReserved < job.slotsTotal) {
                // Check not already applied
                const existing = await prisma_1.default.reservation.findFirst({
                    where: { jobId, workerId }
                });
                if (!existing) {
                    await prisma_1.default.$transaction([
                        prisma_1.default.reservation.create({
                            data: {
                                jobId,
                                workerId,
                                status: 'CONFIRMED',
                                checkinMethods: ['manual'],
                                idempotencyKey: `ivr-${workerId}-${jobId}-${Date.now()}`
                            }
                        }),
                        prisma_1.default.job.update({
                            where: { id: jobId },
                            data: { slotsReserved: { increment: 1 } }
                        })
                    ]);
                    // Send SMS confirmation
                    if (worker.user.phone) {
                        (0, sms_1.sendSms)(worker.user.phone, `✅ BharatWork: आपने "${job.title}" के लिए आवेदन कर दिया है! ₹${job.wagePerDay}/दिन। जॉब ID: ${jobId.slice(0, 8)}`).catch(console.error);
                    }
                    twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    बहुत अच्छे! आपकी जॉब बुक हो गई है। आपके फोन पर SMS आएगा। धन्यवाद।
  </Say>
</Response>`;
                }
                else {
                    twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    आपने पहले से इस जॉब के लिए आवेदन किया हुआ है। धन्यवाद।
  </Say>
</Response>`;
                }
            }
            else {
                twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    खेद है, यह जॉब अब उपलब्ध नहीं है। धन्यवाद।
  </Say>
</Response>`;
            }
        }
        catch (err) {
            console.error('[IVR] Accept error:', err.message);
            twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, an error occurred. Please try again later.</Say>
</Response>`;
        }
    }
    else {
        // Worker declined or wrong key
        twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    ठीक है। आपने जॉब अस्वीकार कर दी। धन्यवाद।
  </Say>
</Response>`;
    }
    res.type('text/xml').send(twimlReply);
};
exports.ivrResponse = ivrResponse;
/**
 * POST /api/ivr/status
 * Twilio call status callback (optional logging).
 */
const ivrStatus = (req, res) => {
    const { CallSid, CallStatus, To } = req.body;
    console.log(`[IVR STATUS] ${CallSid} → ${To}: ${CallStatus}`);
    res.sendStatus(200);
};
exports.ivrStatus = ivrStatus;
//# sourceMappingURL=ivr.js.map