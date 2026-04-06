import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/lib/supabase/server';
import { createJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    validateServerConfig();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
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

    // Check if user is an admin (from custom claims or admin table)
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

    // Create JWT token
    const jwtToken = await createJWT(data.user.id, email);

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        admin: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
        },
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set({
      name: 'admin_token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
