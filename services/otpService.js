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

    if (!storedOtpData || 
        storedOtpData.otp !== otp || 
        Date.now() > storedOtpData.expiresAt) {
      delete this.registrationOtpStore[email];
      return { isValid: false };
    }

    const userData = storedOtpData.userData;
    delete this.registrationOtpStore[email];
    return { isValid: true, userData };
  }

  // Verify forgot password OTP
  verifyForgotPasswordOtp(email, otp) {
    const storedOtpData = this.forgotPasswordOtpStore[email];

    if (!storedOtpData || 
        storedOtpData.otp !== otp || 
        Date.now() > storedOtpData.expiresAt) {
      delete this.forgotPasswordOtpStore[email];
      return { isValid: false };
    }

    delete this.forgotPasswordOtpStore[email];
    return { isValid: true };
  }
}

export default new OtpService();