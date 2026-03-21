import { Request, Response } from 'express';
import prisma from '../prisma';
import { buildJobAlertTwiml } from '../services/ivr';
import { sendSms } from '../services/sms';
import logger from '../utils/logger';

/**
 * GET /api/ivr/twiml
 * Twilio fetches this URL when placing the call.
 * Returns TwiML XML to read out job details and gather keypress.
 */
export const ivrTwiml = (req: Request, res: Response) => {
    const { jobId, workerId, title, wage, dist, company, urgent } = req.query as Record<string, string>;

    if (!jobId || !workerId) {
        return res.status(400).type('text/xml').send(`
            <?xml version="1.0" encoding="UTF-8"?>
            <Response><Say>Invalid request. Goodbye.</Say></Response>
        `);
    }

    const twiml = buildJobAlertTwiml(
        jobId,
        workerId,
        title || 'Job',
        wage || '0',
        dist || '0',
        company || 'Employer',
        urgent === 'true'
    );

    res.type('text/xml').send(twiml);
};

/**
 * POST /api/ivr/response
 * Twilio posts here with worker's keypress digit.
 * 1 = Accept, 2 = Decline
 */
export const ivrResponse = async (req: Request, res: Response) => {
    const jobId = req.query.jobId as string;
    const workerId = req.query.workerId as string;
    const digit = req.body?.Digits;

    logger.info(`[IVR] Response — Job: ${jobId} | Worker: ${workerId} | Key: ${digit}`);

    let twimlReply: string;

    if (!jobId || !workerId) {
        res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Invalid request. Goodbye.</Say></Response>`);
        return;
    }

    if (digit === '1') {
        // Worker accepted — apply for the job
        try {
            const worker = await prisma.worker.findFirst({
                where: { id: workerId },
                include: { user: { select: { phone: true, name: true } } }
            });

            const job = await prisma.job.findUnique({ where: { id: jobId } });

            if (worker && job && job.status === 'open' && job.slotsReserved < job.slotsTotal) {
                // Check not already applied
                const existing = await prisma.reservation.findFirst({
                    where: { jobId, workerId }
                });

                if (!existing) {
                    await prisma.$transaction([
                        prisma.reservation.create({
                            data: {
                                jobId,
                                workerId,
                                status: 'CONFIRMED',
                                checkinMethods: ['manual'],
                                idempotencyKey: `ivr-${workerId}-${jobId}-${Date.now()}`
                            }
                        }),
                        prisma.job.update({
                            where: { id: jobId },
                            data: { slotsReserved: { increment: 1 } }
                        })
                    ]);

                    // Send SMS confirmation
                    if (worker.user.phone) {
                        sendSms(
                            worker.user.phone,
                            `✅ BharatWork: आपने "${job.title}" के लिए आवेदन कर दिया है! ₹${job.wagePerDay}/दिन। जॉब ID: ${jobId.slice(0, 8)}`
                        ).catch((e: any) => logger.error('[IVR] SMS confirmation failed', { message: e.message }));
                    }

                    twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    बहुत अच्छे! आपकी जॉब बुक हो गई है। आपके फोन पर SMS आएगा। धन्यवाद।
  </Say>
</Response>`;
                } else {
                    twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    आपने पहले से इस जॉब के लिए आवेदन किया हुआ है। धन्यवाद।
  </Say>
</Response>`;
                }
            } else {
                twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    खेद है, यह जॉब अब उपलब्ध नहीं है। धन्यवाद।
  </Say>
</Response>`;
            }
        } catch (err: any) {
            logger.error('[IVR] Accept error:', { message: err.message });
            twimlReply = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, an error occurred. Please try again later.</Say>
</Response>`;
        }
    } else {
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

/**
 * POST /api/ivr/status
 * Twilio call status callback (optional logging).
 */
export const ivrStatus = (req: Request, res: Response) => {
    const { CallSid, CallStatus, To } = req.body;
    logger.info(`[IVR STATUS] ${CallSid} → ${To}: ${CallStatus}`);
    res.sendStatus(200);
};
