import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const [key, ...valueParts] = line.split('=');
  envVars[key.trim()] = valueParts.join('=').trim();
});

const config = {
  host: envVars.SMTP_HOST,
  port: parseInt(envVars.SMTP_PORT),
  secure: envVars.SMTP_SECURE === 'true',
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASSWORD,
  },
};

console.log('\n🔧 SMTP Configuration:');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('Secure:', config.secure);
console.log('User:', config.auth.user);
console.log('Pass:', config.auth.pass);
console.log('');

const transporter = nodemailer.createTransport(config);

async function testEmail() {
  try {
    console.log('🔍 Testing SMTP connection...\n');
    
    const verified = await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    console.log('📧 Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: `HopeCard <${config.auth.user}>`,
      to: config.auth.user,
      subject: 'Test OTP - 123456',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9b2c2c;">HopeCard Admin Login</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #9b2c2c; letter-spacing: 5px; font-size: 32px; text-align: center; margin: 20px 0;">
            123456
          </h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n✅ Check your email inbox for the test message.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:');
    console.error(error);
  }
}

testEmail();
