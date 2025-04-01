import mongoose from "mongoose";

const userGuideSchema = new mongoose.Schema({
    userId:{ type: String },
    progress:{ type: Number, default: 0 },
    stepsCompleted: {
        demo: { type: Boolean, default: false },
        practice: { type: Boolean, default: false },
        report: { type: Boolean, default: false }
     },
}, { timestamps: true });

const UserGuide = mongoose.model("UserGuide", userGuideSchema);
export default UserGuide;