// Test email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    console.log('SMTP Configuration:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('Secure:', process.env.SMTP_SECURE);
    console.log('User:', process.env.SMTP_USER);
    console.log('Password length:', process.env.SMTP_PASSWORD?.length);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log('\n🔍 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');

    const info = await transporter.sendMail({
      from: `HopeCard <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test OTP',
      text: 'Test OTP: 123456',
    });

    console.log('✅ Email sent!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();
