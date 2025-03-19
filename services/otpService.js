import crypto from 'crypto';

class OtpService {
  constructor() {
    this.registrationOtpStore = {};
    this.forgotPasswordOtpStore = {};
  }

  // Generate OTP for registration
  generateRegistrationOtp(email, userData) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.registrationOtpStore[email] = { 
      otp, 
      expiresAt: expirationTime, 
      userData 
    };
    return otp;
  }

  // Generate OTP for forgot password
  generateForgotPasswordOtp(email) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.forgotPasswordOtpStore[email] = { 
      otp, 
      expiresAt: expirationTime 
    };
    return otp;
  }

  // Verify registration OTP
  verifyRegistrationOtp(email, otp) {
    const storedOtpData = this.registrationOtpStore[email];

    if (!storedOtpData) {
      return { isValid: false, message: 'No OTP found for this email' };
    }

    if (storedOtpData.otp !== otp) {
      return { isValid: false, message: 'Invalid OTP' };
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete this.registrationOtpStore[email]; // Delete only if expired
      return { isValid: false, message: 'OTP has expired' };
    }

    // OTP is valid, delete it after successful verification
    const userData = storedOtpData.userData;
    delete this.registrationOtpStore[email];
    return { isValid: true, userData };
  }

  // Verify forgot password OTP
  verifyForgotPasswordOtp(email, otp) {
    const storedOtpData = this.forgotPasswordOtpStore[email];

    if (!storedOtpData) {
      return { isValid: false, message: 'No OTP found for this email' };
    }

    if (storedOtpData.otp !== otp) {
      return { isValid: false, message: 'Invalid OTP' };
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete this.forgotPasswordOtpStore[email]; // Delete only if expired
      return { isValid: false, message: 'OTP has expired' };
    }

    // OTP is valid, delete it after successful verification
    delete this.forgotPasswordOtpStore[email];
    return { isValid: true };
  }
}

export default new OtpService();