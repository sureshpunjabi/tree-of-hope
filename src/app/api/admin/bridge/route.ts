import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface BridgeCampaign {
  id: string;
  campaign_id: string;
  status: string;
  gofundme_url?: string;
  gofundme_title?: string;
  gofundme_organiser_name?: string;
  gofundme_raised_cents?: number;
  gofundme_goal_cents?: number;
  gofundme_donor_count?: number;
  gofundme_category?: string;
  claimed_by?: string;
  outreach_attempts: number;
  created_at: string;
}

interface BridgeResponse {
  success: boolean;
  bridges?: BridgeCampaign[];
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<BridgeResponse>> {
  try {
    const supabase = getServiceSupabase();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase.from('bridge_campaigns').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bridges = [], error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bridges' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bridges: bridges || [],
    });
  } catch (error) {
    console.error('Error fetching bridges:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
