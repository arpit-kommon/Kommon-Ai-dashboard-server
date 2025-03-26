import Notification from '../models/Notification.js';
import User from '../models/userModel.js';

const notificationController = {
  // Existing: Send notification (broadcast or specific)
  sendNotification: async (req, res) => {
    const { userId, message, broadcast = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (!broadcast && !userId) {
      return res.status(400).json({ message: 'User ID is required unless broadcast is true' });
    }

    try {
      const io = req.app.get('socketio');

      if (broadcast) {
        const users = await User.find({});
        const notifications = users.map((user) => ({
          userId: user._id,
          message,
          createdAt: new Date(),
          read: false,
        }));
        await Notification.insertMany(notifications);
        io.emit('newNotification', { message, createdAt: new Date(), read: false });
        res.status(200).json({ message: 'Notification broadcasted to all users' });
      } else {
        const notification = new Notification({ userId, message });
        await notification.save();
        io.to(userId).emit('newNotification', notification);
        res.status(200).json({ message: 'Notification sent successfully', data: notification });
      }
    } catch (error) {
      console.error('Error in sendNotification:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // New: Send notification to a specific user only
  sendToSpecificUser: async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const notification = new Notification({ userId, message });
      await notification.save();

      const io = req.app.get('socketio');
      io.to(userId).emit('newNotification', notification);

      res.status(200).json({ message: 'Notification sent to specific user', data: notification });
    } catch (error) {
      console.error('Error in sendToSpecificUser:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get notifications for a user
  getNotifications: async (req, res) => {
    const { userId } = req.params;

    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // New: Send notification to multiple users by userIds
  sendToMultipleUsers: async (req, res) => {
    const { userIds, message } = req.body;

    if (!message || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Message and a non-empty array of user IDs are required' });
    }

    try {
      const io = req.app.get('socketio');

      // Verify all userIds exist
      const users = await User.find({ _id: { $in: userIds } });
      const validUserIds = users.map(user => user._id.toString());
      const invalidUserIds = userIds.filter(id => !validUserIds.includes(id));

      if (invalidUserIds.length > 0) {
        return res.status(404).json({ 
          message: 'Some users not found', 
          invalidUserIds 
        });
      }

      // Create notifications for all valid users
      const notifications = userIds.map(userId => ({
        userId,
        message,
        createdAt: new Date(),
        read: false,
      }));
      await Notification.insertMany(notifications);

      // Send notifications via WebSocket to each user
      userIds.forEach(userId => {
        io.to(userId).emit('newNotification', { 
          userId, 
          message, 
          createdAt: new Date(), 
          read: false 
        });
      });

      res.status(200).json({ 
        message: 'Notifications sent to multiple users', 
        userIds 
      });
    } catch (error) {
      console.error('Error in sendToMultipleUsers:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    const { notificationId } = req.params;

    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

export default notificationController;