import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;