import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import multer from 'multer';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken'; // Add jsonwebtoken for generating reset tokens
import otpService from '../services/otpService.js';
import emailService from '../services/emailService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Multer setup with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed'));
    }
  },
});

// Register a new user with OTP
const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dob,
      gender,
      location,
      profilePicture
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = {
        status: 400,
        message: 'Email already in use',
        extraDetails: 'A user with this email already exists',
      };
      console.error('Registration error:', error);
      return res.status(400).json(error);
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dob,
      gender,
      location,
      profilePicture
    };
    const otp = otpService.generateRegistrationOtp(email, userData);

    await emailService.sendEmail(email, 'otpVerification', { otp, firstName, lastName });

    console.log('OTP sent successfully to:', email);
    res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    next(error);
  }
};

// Verify OTP and complete registration
const verifyRegOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const { isValid, userData } = otpService.verifyRegistrationOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber || null,
      dob: userData.dob ? new Date(userData.dob) : null,
      gender: userData.gender || null,
      location: userData.location ? {
        city: userData.location.city || null,
        state: userData.location.state || null,
        country: userData.location.country || null,
      } : null,
      profilePicture: userData.profilePicture || null,
    });

    const savedUser = await user.save();
    const token = user.generateAuthToken();

    await emailService.sendEmail(email, 'welcome', {
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    console.log('User registered successfully:', savedUser.email);
    res.status(201).json({
      message: 'User registered successfully',
      userId: savedUser._id,
      token,
    });
  } catch (error) {
    console.error('Error in verifyRegOtp:', error.message);
    next(error);
  }
};

// Forgot Password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal if the email exists
      return res.status(200).json({ 
        message: 'If an account exists, an OTP will be sent to the provided email.' 
      });
    }

    const otp = otpService.generateForgotPasswordOtp(email);

    await emailService.sendEmail(
      email,
      'forgotPassword',
      { 
        otp, 
        firstName: user.firstName || 'User', 
        lastName: user.lastName || '' 
      }
    );

    console.log('Forgot password OTP sent successfully to:', email);
    res.status(200).json({ 
      message: 'Forgot password OTP sent successfully.' 
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error.message);
    next(error);
  }
};

// Verify Forgot Password OTP
const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const { isValid } = otpService.verifyForgotPasswordOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a short-lived reset token
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'your-secret-key', // Ensure you have a JWT_SECRET in your .env
      { expiresIn: '10m' } // Token expires in 10 minutes
    );

    console.log('OTP verified successfully for:', email);
    res.status(200).json({ 
      message: 'OTP verified successfully', 
      resetToken 
    });
  } catch (error) {
    console.error('Error in verifyForgotPasswordOtp:', error.message);
    next(error);
  }
};

// Reset Password (requires resetToken)
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ 
        message: 'Email, new password, and reset token are required' 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Ensure the token matches the email
    if (decoded.email !== email) {
      return res.status(400).json({ 
        message: 'Invalid reset token for this email' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Optional: Password strength check
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    user.password = newPassword; // Pre-save hook hashes it
    await user.save();

    await emailService.sendEmail(
      email,
      'passwordResetConfirmation',
      { 
        firstName: user.firstName || 'User', 
        lastName: user.lastName || '' 
      }
    );

    console.log('Password reset successfully for:', email);
    res.status(200).json({ 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Error in resetPassword:', error.message);
    next(error);
  }
};

// Update Profile Picture with resizing
const updateProfilePicture = [
  upload.single('profilePicture'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id); // Updated to use req.user
      if (!user) {
        const error = {
          status: 404,
          message: 'User not found',
          extraDetails: 'No user exists with this ID',
        };
        console.error('Error in updateProfilePicture:', error);
        return res.status(404).json(error);
      }

      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const uploadDir = `${__dirname}/../uploads`;
        const profilePicturePath = `${uploadDir}/${fileName}`;

        await fs.mkdir(uploadDir, { recursive: true });

        await sharp(req.file.buffer)
          .resize({ width: 300, height: 300, fit: 'cover', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(profilePicturePath);

        user.profilePicture = `/uploads/${fileName}`;
      }

      await user.save();
      console.log('Profile picture updated successfully:', user.profilePicture);
      res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      next(error);
    }
  },
];

// Update User Info
const updateUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id); // Updated to use req.user
    if (!user) {
      const error = {
        status: 404,
        message: 'User not found',
        extraDetails: 'No user exists with this ID',
      };
      console.error('Error in updateUserInfo:', error);
      return res.status(404).json(error);
    }

    const { firstName, lastName, phoneNumber, dob, gender, location } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.dob = dob ? new Date(dob) : user.dob;
    user.gender = gender || user.gender;
    if (location) {
      user.location = {
        city: location.city || user.location?.city || null,
        state: location.state || user.location?.state || null,
        country: location.country || null,
      };
    }

    await user.save();
    console.log('User info updated successfully', user);
    res.json({ message: 'User info updated', user });
  } catch (error) {
    console.error('Error in updateUserInfo:', error);
    next(error);
  }
};

// Login User
const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = {
        status: 401,
        message: "User doesn't exist",
        extraDetails: 'No user found with this email',
      };
      console.error('Login error:', error);
      return res.status(401).json(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = {
        status: 401,
        message: 'Invalid credentials',
        extraDetails: 'Password does not match',
      };
      console.error('Login error:', error);
      return res.status(401).json(error);
    }

    const token = user.generateAuthToken();
    console.log('User logged in successfully:', user.email);
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error('Error in userLogin:', error.message);
    next(error);
  }
};

// Get User Data
const user = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ userData });
  } catch (error) {
    console.error('Error from the user route:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export {
  registerUser,
  verifyRegOtp,
  updateProfilePicture,
  updateUserInfo,
  user,
  userLogin,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword
};