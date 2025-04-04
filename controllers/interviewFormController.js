import InterviewForm from "../models/interviewFormModel.js";

const createInterviewForm = async (req, res) =>{
    try {
        const {userId, interviewType, interviewerPosition, interviewerBehavior, noOfQuestions, roleAppyingFor, companyName } = req.body;
        const interviewForm = new InterviewForm({
            userId,
            interviewType,
            interviewerPosition,
            interviewerBehavior,
            noOfQuestions,
            roleAppyingFor,
            companyName
        })
        await interviewForm.save();
        res.status(200).json({status:true, message:"Interview Form Created Successfully", data: interviewForm});
    } catch (error) {
        console.error("Error creating interview form:", error);
        res.status(500).json({status:false, message:"Internal Server Error", error:error.message});
        
    }
}

export {createInterviewForm};