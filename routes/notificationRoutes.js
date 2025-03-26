import express from 'express';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send', notificationController.sendNotification); // Existing: Broadcast or specific
router.post('/send-specific', notificationController.sendToSpecificUser); // New: Specific user only
router.post('/send-multiple', notificationController.sendToMultipleUsers); // Multiple users
router.get('/:userId', notificationController.getNotifications);
router.patch('/read/:notificationId', notificationController.markAsRead);

export default router;