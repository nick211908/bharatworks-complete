import express from 'express';
import { ivrTwiml, ivrResponse, ivrStatus } from '../controllers/ivr';

const router = express.Router();

// Twilio fetches this to get call instructions (TwiML)
router.get('/twiml', ivrTwiml);

// Twilio posts keypress result here
router.post('/response', express.urlencoded({ extended: false }), ivrResponse);

// Twilio posts call status updates here
router.post('/status', express.urlencoded({ extended: false }), ivrStatus);

export default router;
