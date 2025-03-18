import crypto from 'crypto';

class OtpService {
  constructor() {
    this.otpStore = {};
  }

  // Generate OTP and store it
  generateOtp(email, userData) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otpStore[email] = { otp, expiresAt: expirationTime, userData };
    return otp;
  }

  // Verify OTP
  verifyOtp(email, otp) {
    const storedOtpData = this.otpStore[email];

    if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expiresAt) {
      delete this.otpStore[email]; // Clear expired/invalid OTP
      return { isValid: false };
    }

    const userData = storedOtpData.userData;
    delete this.otpStore[email]; // Clear OTP after successful verification
    return { isValid: true, userData };
  }
}

export default new OtpService();