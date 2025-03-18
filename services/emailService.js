import nodemailer from 'nodemailer';

// Nodemailer transporter configuration with verbose logging
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER, // Sender email from environment variables
    pass: process.env.EMAIL_PASS, // App-specific password from environment variables
  },
  logger: true, // Enable logging for SMTP interactions
  debug: true, // Include debug output in logs
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error.message);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

// Function to send email using Nodemailer
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Example Company" <${process.env.EMAIL_USER}>`, // Sender with a friendly name
      to, // Dynamic recipient address
      subject, // Dynamic subject
      text, // Dynamic plain text body
      html, // Dynamic HTML body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to, 'Message ID:', info.messageId);
    return info; // Return the info for further use if needed
  } catch (error) {
    console.error('Error sending email to:', to, 'Details:', error.message);
    throw error; // Re-throw to be caught by the caller
  }
};

class EmailService {
  constructor() {
    this.templates = {
      otpVerification: (otp, firstName, lastName) => ({
        subject: 'Verify Your Email to Complete Registration',
        text: `Your OTP code is ${otp}`,
        html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <div style="background-color: #4CAF50; color: #ffffff; text-align: center; padding: 20px;">
              <h1 style="margin: 0; font-size: 24px;">OTP Verification</h1>
            </div>
            <div style="padding: 20px; color: #333333;">
              <h2 style="font-size: 20px; color: #4CAF50;">Hello ${firstName} ${lastName}!</h2>
              <p>Your OTP code is below. Please enter this code to verify your email and complete the sign-up process.</p>
              <div style="text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; color: #4CAF50;">${otp}</div>
              <p>This OTP is valid for 10 minutes. If you did not request this code, please disregard this email or <a href="mailto:support@example.com">contact support</a>.</p>
            </div>
            <div style="background-color: #f4f4f4; color: #777777; text-align: center; padding: 20px; font-size: 14px;">
              <p>© 2024 by Example Company. All rights reserved.</p>
            </div>
          </div>
        </body>`,
      }),

      welcome: (firstName, lastName) => ({
        subject: `Welcome to Our Platform, ${firstName}!`,
        text: `
          Welcome!

          Hello ${firstName} ${lastName},

          Congratulations! Your registration was successful, and we’re thrilled to welcome you! 
          Log in to explore and reach out to us at support@example.com if you need help.

          Best regards,
          The Team
        `,
        html: `<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <div style="background-color: #4CAF50; color: #ffffff; text-align: center; padding: 20px;">
              <h1 style="margin: 0; font-size: 24px;">Welcome!</h1>
            </div>
            <div style="padding: 20px; color: #333333;">
              <h2 style="font-size: 20px; color: #4CAF50;">Hello ${firstName} ${lastName}!</h2>
              <p>Congratulations! Your registration was successful. We’re excited to have you on board.</p>
              <p>Log in to explore, and feel free to <a href="mailto:support@example.com">contact support</a> if you have questions.</p>
            </div>
            <div style="background-color: #f4f4f4; color: #777777; text-align: center; padding: 20px; font-size: 14px;">
              <p>© 2024 by Example Company. All rights reserved.</p>
            </div>
          </div>
        </body>`,
      }),
    };
  }

  // Send email using a template
  async sendEmail(to, templateName, data) {
    const template = this.templates[templateName](data.otp || '', data.firstName || '', data.lastName || '');
    await sendEmail(to, template.subject, template.text, template.html);
  }
}

export default new EmailService();