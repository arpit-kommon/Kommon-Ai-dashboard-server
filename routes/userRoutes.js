import express from 'express';
import { 
  registerUser, 
  verifyOtp, 
  updateProfilePicture, 
  updateUserInfo, 
  user, 
  userLogin,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js';
import validate from '../middleware/validate.js';
import { registerSchema, updateUserInfoSchema } from '../validations/userValidation.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user (sends OTP)
router.post('/register', validate(registerSchema), registerUser);

// Verify OTP to complete registration
router.post('/verify-otp', verifyOtp);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);
// Login user
router.post('/login', userLogin);

// Update profile picture (authenticated)
router.put('/users/:userId/profile-picture', authMiddleware, updateProfilePicture);

// Update user info (authenticated)
router.put('/users/:userId', validate(updateUserInfoSchema), authMiddleware, updateUserInfo);

// Get user data (authenticated)
router.get('/user', authMiddleware, user);

export default router;