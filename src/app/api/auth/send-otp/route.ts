import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { generateOTP } from '@/lib/auth';

// In production, use a real email service
const emailService = {
  sendEmail: async (to: string, subject: string, text: string) => {
    // TODO: Integrate with a real email service (SendGrid, Resend, etc.)
    console.log(`Email sent to ${to}: ${subject}\n${text}`);
    return true;
  },
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists in admins table
    const { data: adminData, error: adminError } = await supabaseServer
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Email not found in admin list' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: otpError } = await supabaseServer
      .from('otp_sessions')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // Send OTP via email
    const emailSent = await emailService.sendEmail(
      email,
      'Your HopeCard Admin OTP',
      `Your one-time password is: ${otp}\n\nThis code will expire in 10 minutes.`
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to email',
        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
