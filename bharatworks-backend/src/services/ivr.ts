import twilio from 'twilio';
import logger from '../utils/logger';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const isDev = !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxx');

const BASE_URL = process.env.BACKEND_BASE_URL || 'https://your-app.railway.app';

export interface IvrJobPayload {
    jobId: string;
    workerId: string;
    title: string;
    wagePerDay: number;
    distanceKm: number;
    companyName: string;
    urgent: boolean;
}

/**
 * Initiate an IVR call to an offline worker with job details.
 */
export const callWorkerWithJobAlert = async (
    phone: string,
    job: IvrJobPayload
): Promise<void> => {
    if (isDev) {
        logger.debug(`[MOCK IVR] Would call ${phone} for job "${job.title}" (₹${job.wagePerDay}/day)`);
        return;
    }

    // Twilio will GET this URL to get TwiML instructions for the call
    const twimlUrl = `${BASE_URL}/api/ivr/twiml?jobId=${job.jobId}&workerId=${job.workerId}&title=${encodeURIComponent(job.title)}&wage=${job.wagePerDay}&dist=${job.distanceKm.toFixed(1)}&company=${encodeURIComponent(job.companyName)}&urgent=${job.urgent}`;

    const call = await client.calls.create({
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        url: twimlUrl,
        statusCallback: `${BASE_URL}/api/ivr/status`,
        statusCallbackMethod: 'POST',
        timeout: 30, // ring for 30 seconds
    });

    logger.info(`[IVR] Initiated call ${call.sid} to ${phone} for job "${job.title}"`);
};

/**
 * Build TwiML XML for the job alert prompt.
 * Twilio reads this out to the worker and waits for keypress.
 */
export const buildJobAlertTwiml = (
    jobId: string,
    workerId: string,
    title: string,
    wage: string,
    dist: string,
    company: string,
    urgent: boolean
): string => {
    const urgentIntro = urgent
        ? '<Say voice="Polly.Aditi" language="hi-IN">अर्जेंट जॉब अलर्ट!</Say>'
        : '';

    // Response webhook URL  
    const responseUrl = `${BASE_URL}/api/ivr/response?jobId=${jobId}&workerId=${workerId}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${urgentIntro}
  <Say voice="Polly.Aditi" language="hi-IN">
    नमस्ते! BharatWork से एक नई जॉब उपलब्ध है।
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="hi-IN">
    काम: ${title}।
    वेतन: ${wage} रुपये प्रति दिन।
    दूरी: ${dist} किलोमीटर।
    नियोक्ता: ${company}।
  </Say>
  <Pause length="1"/>
  <Gather action="${responseUrl}" method="POST" numDigits="1" timeout="15">
    <Say voice="Polly.Aditi" language="hi-IN">
      जॉब स्वीकार करने के लिए 1 दबाएं।
      अस्वीकार करने के लिए 2 दबाएं।
    </Say>
  </Gather>
  <Say voice="Polly.Aditi" language="hi-IN">
    कोई जवाब नहीं मिला। कॉल समाप्त हो रही है। धन्यवाद।
  </Say>
</Response>`;
};
