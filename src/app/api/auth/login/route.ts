import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createJWT } from '@/lib/auth';

// Hardcoded to ensure they work
const SUPABASE_URL = 'https://hycsbfugiboutvgbvueg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3NiZnVnaWJvdXR2Z2J2dWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjM5NTMsImV4cCI6MjA4ODg5OTk1M30.UGRemYyXEmvyziepxCKdzJk2Gc5fwjU5zkTqYK7q61g';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3NiZnVnaWJvdXR2Z2J2dWVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyMzk1MywiZXhwIjoyMDg4ODk5OTUzfQ.t0Y64frQ7GsAHEUBz4D2YXsSPtpk9q9bmoco31sSWEM';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log('❌ Auth failed:', signInError.message);
      return NextResponse.json(
        { error: `Invalid email or password: ${signInError.message}` },
        { status: 401 }
      );
    }

    console.log('✅ Login successful:', email);

    // OTP DISABLED: Skip OTP and directly create JWT token
    console.log('⚠️  OTP is currently disabled - proceeding with direct authentication');

    // Get user from Supabase Auth
    const { data: { users }, error: usersError } = await createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    ).auth.admin.listUsers();

    let adminUser = null;
    if (!usersError && users) {
      adminUser = users.find(u => u.email === email);
    }

    if (!adminUser) {
      adminUser = {
        id: email.replace('@', '-').replace('.', '-'),
        email: email,
        user_metadata: { name: 'Admin User' },
      };
    }

    // Create JWT token directly (skip OTP verification)
    const jwtToken = await createJWT(adminUser.id, adminUser.email || email);

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token: jwtToken,
        admin_info: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.user_metadata?.name || 'Admin User',
        },
      },
      { status: 200 }
    );

    // Set token in secure HTTP-only cookie (24h expiry)
    response.cookies.set('admin_token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
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
