import axios from 'axios';

const notificationServiceApi = async (currentTime, userId) => {
    console.log(`Notification service ---------------------: ${userId}`);
    const data = { userId: userId, message: "Your exclusive update is here!" };
    try {
        const notification = await axios.post("http://localhost:3000/v1/api/notifications/send-specific", data);
        console.log(notification.data);
        return {
            status: 'success',
            executedAt: currentTime,
            data: notification.data
        };
    } catch (error) {
        return {
            status: 'error',
            executedAt: currentTime,
            error: error.message
        };
    }
};

export default notificationServiceApi;