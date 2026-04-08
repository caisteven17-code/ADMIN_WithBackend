import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/lib/supabase/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hopecard-admin-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword, token: tokenFromBody } =
      await request.json();

    // Get JWT token from cookie, header, or request body
    let token = request.cookies.get('admin_token')?.value || tokenFromBody;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - no token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let verified;
    try {
      verified = await jwtVerify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const userId = verified.payload.sub as string;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate Supabase is configured
    validateServerConfig();

    // Get admin email to verify current password
    const { data: adminData, error: adminError } = await supabaseServer
      .from('admins')
      .select('email')
      .eq('id', userId)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const { error: signInError } = await supabaseServer.auth.signInWithPassword({
      email: adminData.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password using admin API
    const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
