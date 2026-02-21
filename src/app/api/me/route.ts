import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

interface ProfileResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ProfileResponse>> {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const supabase = getServiceSupabase();

    // Verify token and get user
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = data.user;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
