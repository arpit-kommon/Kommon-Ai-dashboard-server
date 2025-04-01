import express from 'express';
import { postUserGuide, getUserGuide, updateUserGuide} from '../controllers/userGuideController.js';

const router = express.Router();

router.post('/', postUserGuide);
router.get('/get/:userId', getUserGuide);
router.put('/update', updateUserGuide);

export default router;