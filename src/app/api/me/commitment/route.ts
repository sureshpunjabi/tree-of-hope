import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface Commitment {
  id: string;
  campaign_id: string;
  user_id: string;
  monthly_tier: string;
  status: string;
  started_at: string;
  paused_at?: string;
  paused_until?: string;
  resume_date?: string;
  campaign?: Record<string, unknown>;
}

interface CommitmentResponse {
  success: boolean;
  commitments?: Commitment[];
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<CommitmentResponse>> {
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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Fetch commitments with campaign data
    const { data: commitments = [], error } = await supabase
      .from('commitments')
      .select('*, campaign:campaigns(*)')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch commitments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commitments: commitments || [],
    });
  } catch (error) {
    console.error('Error fetching commitments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
