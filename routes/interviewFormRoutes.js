import express from 'express';
import { createInterviewForm } from '../controllers/interviewFormController.js';

const router = express.Router();

router.post('/create', createInterviewForm);

export default router;