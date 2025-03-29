import express from 'express';
import { uploadSchedule, getAllSchedules } from '../controllers/scheduleController.js';

const router = express.Router();

router.post('/', uploadSchedule);
router.get('/get', getAllSchedules);

export default router;