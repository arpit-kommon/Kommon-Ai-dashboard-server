import UserGuide from "../models/userGuide.js";

// POST: Create new user guide data
const postUserGuide = async (req, res) => {
  try {
    const { progress, stepsCompleted, userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ status: "error", message: "userId is required" });
    }

    // Check if data already exists
    const existingGuide = await UserGuide.findOne({ userId });
    if (existingGuide) {
      return res.status(409).json({ status: "error", message: "User guide already exists for this userId" });
    }

    const userGuide = new UserGuide({
      userId,
      progress: progress || 0,
      stepsCompleted: {
        demo: stepsCompleted?.demo || false,
        practice: stepsCompleted?.practice || false,
        report: stepsCompleted?.report || false,
      },
    });

    const userGuideData = await userGuide.save();
    console.log(`User guide data saved:`, userGuideData);
    res.status(201).json({
      status: "ok",
      message: "User guide data saved successfully",
      data: userGuideData,
    });
  } catch (error) {
    console.error("Error saving user guide data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to save user guide data",
      error: error.message,
    });
  }
};

// GET: Fetch user guide data by userId
const getUserGuide = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ status: "error", message: "userId is required" });
    }

    const userGuideData = await UserGuide.findOne({ userId });
    if (!userGuideData) {
      return res.status(404).json({ status: "error", message: "User guide data not found" });
    }

    console.log(`User guide data for user ${userId}:`, userGuideData);
    res.status(200).json({
      status: "ok",
      message: "User guide data fetched successfully",
      data: userGuideData,
    });
  } catch (error) {
    console.error("Error fetching user guide data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user guide data",
      error: error.message,
    });
  }
};

// PUT: Update existing user guide data
const updateUserGuide = async (req, res) => {
  try {
    const { userId, progress, stepsCompleted } = req.body;

    if (!userId) {
      return res.status(400).json({ status: "error", message: "userId is required" });
    }

    const updateData = {
      progress: progress || 0,
      stepsCompleted: {
        demo: stepsCompleted?.demo || false,
        practice: stepsCompleted?.practice || false,
        report: stepsCompleted?.report || false,
      },
      updatedAt: Date.now(), // Update timestamp
    };

    const updatedUserGuide = await UserGuide.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedUserGuide) {
      return res.status(404).json({ status: "error", message: "User guide data not found" });
    }

    console.log(`User guide data updated for user ${userId}:`, updatedUserGuide);
    res.status(200).json({
      status: "ok",
      message: "User guide data updated successfully",
      data: updatedUserGuide,
    });
  } catch (error) {
    console.error("Error updating user guide data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user guide data",
      error: error.message,
    });
  }
};

export { postUserGuide, getUserGuide, updateUserGuide };