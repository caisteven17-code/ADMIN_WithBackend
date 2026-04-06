import { supabaseServer } from './supabase/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Verify JWT token and extract admin data
 */
export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

/**
 * Create JWT token for admin
 */
export async function createJWT(adminId: string, adminEmail: string) {
  const payload = {
    sub: adminId,
    email: adminEmail,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  // Using simple JWT generation for Node.js
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = await generateHMAC(
    `${header}.${body}`,
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  return `${header}.${body}.${signature}`;
}

/**
 * Generate HMAC signature
 */
async function generateHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email
 */
export async function sendOTPEmail(email: string, otp: string) {
  try {
    // Use Supabase Email service or your email provider
    // For now, we'll log it (you should implement actual email sending)
    console.log(`OTP for ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Get admin profile data
 */
export async function getAdminProfile(userId: string) {
  try {
    const { data, error } = await supabaseServer
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}

/**
 * Update admin password
 */
export async function updateAdminPassword(userId: string, newPassword: string) {
  try {
    const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

/**
 * Check if email exists and is admin
 */
export async function isAdminEmail(email: string) {
  try {
    const { data, error } = await supabaseServer
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
}
