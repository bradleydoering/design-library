import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations (server-side only)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // IMPORTANT: Only allow bradley.doering@gmail.com cleanup to prevent accidents
    if (email !== 'bradley.doering@gmail.com') {
      return NextResponse.json({
        error: 'Cleanup restricted to bradley.doering@gmail.com only'
      }, { status: 403 });
    }

    console.log('🧹 Cleaning up test users for:', email);

    // First, find all users with this email
    const { data: authUsers, error: listError } = await supabaseServiceRole.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({
        error: `Failed to list users: ${listError.message}`
      }, { status: 500 });
    }

    const targetUsers = authUsers.users.filter(user => user.email === email);
    console.log(`Found ${targetUsers.length} users with email ${email}`);

    const results = [];

    for (const user of targetUsers) {
      try {
        // Delete from contractor_profiles first (if exists)
        const { error: profileError } = await supabaseServiceRole
          .from('contractor_profiles')
          .delete()
          .eq('id', user.id);

        if (profileError) {
          console.log(`Profile deletion error for ${user.id}:`, profileError.message);
        } else {
          console.log(`✅ Deleted contractor profile for ${user.id}`);
        }

        // Delete from auth.users
        const { data: deletedUser, error: deleteError } = await supabaseServiceRole.auth.admin.deleteUser(user.id);

        if (deleteError) {
          console.error(`Auth user deletion error for ${user.id}:`, deleteError);
          results.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: deleteError.message
          });
        } else {
          console.log(`✅ Deleted auth user ${user.id}`);
          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            deletedAt: new Date().toISOString()
          });
        }
      } catch (userError) {
        console.error(`Exception deleting user ${user.id}:`, userError);
        results.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: userError instanceof Error ? userError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed for ${email}`,
      totalUsers: targetUsers.length,
      results
    });

  } catch (error) {
    console.error('🧹 Cleanup error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}