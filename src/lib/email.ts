import nodemailer from 'nodemailer';

// Email service configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    // Check if email credentials are configured
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Gmail credentials not configured. Logging OTP to console instead.');
      console.log(`\n📧 OTP EMAIL (Console Fallback)`);
      console.log(`To: ${to}`);
      console.log(`OTP: ${otp}`);
      console.log(`---\n`);
      return true;
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: to,
      subject: 'Your HopeCard Admin OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9b2c2c;">HopeCard Admin Login</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #9b2c2c; letter-spacing: 5px; font-size: 32px; text-align: center; margin: 20px 0;">
            ${otp}
          </h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p style="color: #666; font-size: 14px;">
            If you did not request this code, please ignore this email and do not share it with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2026 HopeCard. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`\n📧 EMAIL SENT via Gmail`);
    console.log(`To: ${to}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`---\n`);

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  try {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Gmail credentials not configured. Logging password reset link to console instead.');
      console.log(`\n📧 PASSWORD RESET EMAIL (Console Fallback)`);
      console.log(`To: ${to}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`---\n`);
      return true;
    }

    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: to,
      subject: 'Reset Your HopeCard Admin Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9b2c2c;">Reset Your Password</h2>
          <p>Click the button below to reset your HopeCard admin password:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #9b2c2c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link: ${resetLink}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p style="color: #666; font-size: 14px;">
            If you did not request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2026 HopeCard. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`\n📧 PASSWORD RESET EMAIL SENT via Gmail`);
    console.log(`To: ${to}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`---\n`);

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
