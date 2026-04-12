import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, validateServerConfig } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password required' },
        { status: 400 }
      );
    }

    console.log('🔍 Testing password update for:', email);

    try {
      validateServerConfig();
    } catch (error) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // List all users
    console.log('📋 Fetching all users from Supabase...');
    const { data: { users }, error: listError } = await supabaseServer.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      return NextResponse.json(
        {
          error: 'Failed to list users',
          details: listError.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ Found', users?.length || 0, 'users in Supabase');

    // Find the user by email
    const supabaseUser = users?.find((u: any) => u.email === email);

    if (!supabaseUser) {
      return NextResponse.json(
        {
          error: 'User not found',
          email: email,
          availableUsers: users?.map((u: any) => u.email) || [],
        },
        { status: 404 }
      );
    }

    console.log('✅ Found user:', supabaseUser.email, 'with ID:', supabaseUser.id);

    // Now update the password
    console.log('🔄 Updating password for user ID:', supabaseUser.id);
    const { data, error: updateError } = await supabaseServer.auth.admin.updateUserById(
      supabaseUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update password',
          details: updateError.message,
          userId: supabaseUser.id,
        },
        { status: 500 }
      );
    }

    console.log('✅ Password updated successfully!');
    return NextResponse.json(
      {
        success: true,
        message: 'Password updated successfully',
        userId: supabaseUser.id,
        email: supabaseUser.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
