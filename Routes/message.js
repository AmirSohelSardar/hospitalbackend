import express from 'express';
import {
    sendMessage,
    doctorSendMessage,
    getMessages,
    getDoctorMessages,
    getPatientList
} from '../Controllers/MessageController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// IMPORTANT: Static routes must come BEFORE dynamic (:param) routes
// otherwise Express treats "patients" as the :patientId value

// Doctor routes
router.get('/doctor/patients/list', authenticate, restrict(['doctor']), getPatientList);
router.get('/doctor/:patientId',    authenticate, restrict(['doctor']), getDoctorMessages);
router.post('/doctor/send/:patientId', authenticate, restrict(['doctor']), doctorSendMessage);

// Patient routes
router.post('/send/:doctorId', authenticate, restrict(['patient']), sendMessage);
router.get('/:doctorId',       authenticate, restrict(['patient']), getMessages);

export default router;