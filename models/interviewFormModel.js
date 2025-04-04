import mongoose from 'mongoose';

const interviewFormSchema = new mongoose.Schema({
    userId:{type:String, required:true},
    interviewType:{type:String, required:true},
    interviewerPosition:{type:String, required:true},
    interviewerBehavior:{type:String, required:true},
    noOfQuestions:{type:Number, required:true},
    roleAppyingFor:{type:String, required:true},
    companyName:{type:String, required:true},
},{timestamps:true});

const InterviewForm = mongoose.model("InterviewForm", interviewFormSchema);
export default InterviewForm;