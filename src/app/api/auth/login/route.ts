import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/lib/supabase/server';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate Supabase is configured
    validateServerConfig();

    // Sign in with Supabase Auth to verify credentials
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabaseServer
      .from('admins')
      .select('id, email, name')
      .eq('id', data.user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 403 }
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

    // Send OTP via email using Google SMTP
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    // Return success - user needs to verify OTP next
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to email. Please check your inbox.',
        email: email,
        adminId: adminData.id,
        requiresOtp: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
