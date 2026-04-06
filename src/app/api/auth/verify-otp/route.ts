import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/lib/supabase/server';
import { createJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    validateServerConfig();

    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP from database
    const { data: otpData, error: otpError } = await supabaseServer
      .from('otp_sessions')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabaseServer
      .from('otp_sessions')
      .update({ used: true })
      .eq('id', otpData.id);

    // Get admin data
    const { data: adminData, error: adminError } = await supabaseServer
      .from('admins')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Create JWT token
    const jwtToken = await createJWT(adminData.id, adminData.email);

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully. Logging you in...',
        token: jwtToken,
        admin: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
        },
      },
      { status: 200 }
    );

    // Set token in cookie
    response.cookies.set({
      name: 'admin_token',
      value: jwtToken,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
