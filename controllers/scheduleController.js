import Schedule from '../models/scheduleModel.js';

const uploadSchedule = async (req, res) => {
    const { userId, time } = req.body;

    if (!userId || !time) {
        return res.status(400).json({ error: 'userId and time are required' });
    }

    try {
        const schedule = new Schedule({
            userId,
            time: new Date(time)
        });
        await schedule.save();
        console.log(`Schedule saved for user ${schedule}`);
        res.status(201).json({ message: `Schedule for ${userId} saved for ${time}` });
    } catch (error) {
        res.status(500).json({ error: `Failed to save schedule: ${error.message}` });
    }
};

const getAllSchedules = async (req, res) =>{
    try {
        const schedule = await Schedule.find({});
        if (!schedule) {
            return res.status(404).json({ error: 'No schedules found' });
        }
        console.log(`All schedules: ${schedule}`);
        res.status(200).json({status: 'OK', message: "All Schedules Found", data: schedule});
    } catch (error) {
        res.status(500).json({ error: `Failed to get schedules: ${error.message}` });
        
    }
}

export { uploadSchedule, getAllSchedules };