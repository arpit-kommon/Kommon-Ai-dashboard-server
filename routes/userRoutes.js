import express from 'express';
import { 
  registerUser, 
  verifyRegOtp, 
  updateProfilePicture, 
  updateUserInfo, 
  user, 
  userLogin,
  verifyForgotPasswordOtp,
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
router.post('/verify-otp', verifyRegOtp);

// Verify OTP to complete registration
router.post('/verify-for-otp', verifyForgotPasswordOtp);

// Forgot password (sends OTP)
router.post('/forgot-password', forgotPassword);

// Reset password (verifies OTP and updates password)
router.post('/reset-password', resetPassword);

// Login user
router.post('/login', userLogin);

// Get user data (authenticated)
router.get('/user', authMiddleware, user);

// Update user info (authenticated)
router.put('/user', authMiddleware, validate(updateUserInfoSchema), updateUserInfo);

// Update profile picture (authenticated)
router.put('/user/profile-picture', authMiddleware, updateProfilePicture);

export default router;