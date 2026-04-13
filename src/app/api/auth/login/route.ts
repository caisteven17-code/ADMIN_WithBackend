import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createJWT } from '@/lib/auth';
import { getBackendUrlServer } from '@/lib/backend-discovery-server';

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

    // Call backend API to handle login and trigger OTP
    const backendUrl = await getBackendUrlServer();
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await backendResponse.json();

    console.log('📊 Backend response status:', backendResponse.status);
    console.log('📊 Backend response data:', backendData);

    if (!backendResponse.ok) {
      console.log('❌ Backend login failed with status', backendResponse.status);
      // Extract error message from NestJS exception or custom response
      const errorMessage = backendData.error || backendData.message || 'Login failed';
      console.log('❌ Error message:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Login successful, OTP should be sent:', email);

    // OTP ENABLED: Backend has sent OTP, frontend will redirect to verify page
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful. Check your email for OTP.',
        email: email,
        requiresOtp: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
