import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token not provided" });
    }

    // Handle "Bearer " format
    const jwttoken = token.replace("Bearer ", "").trim();
    console.log("Token from auth middleware:", jwttoken);

    try {
        // Verify JWT token
        const isVerified = jwt.verify(jwttoken, process.env.JWT_SECRET);
        console.log("Verified token payload:", isVerified);

        // Find user, exclude password
        const userData = await User.findOne({ email: isVerified.email }).select('-password');
        if (!userData) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        console.log("User data:", userData);

        // Attach data to request
        req.user = userData;
        req.token = token; // Original "Bearer <token>"
        req.userID = userData._id;

        // Proceed to next middleware
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export default authMiddleware;