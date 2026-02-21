import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getAuthenticatedUser } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface ClaimRequest {
  user_id: string;
}

interface ClaimResponse {
  success: boolean;
  campaign?: Record<string, unknown>;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<ClaimResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: ClaimRequest = await request.json();
    const { campaignId } = await params;
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (user.id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: user can only claim for themselves' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Update campaign
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        sanctuary_claimed: true,
        sanctuary_claimed_by: user_id,
        sanctuary_start_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to claim sanctuary:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to claim sanctuary' },
        { status: 500 }
      );
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        campaign_id: campaignId,
        user_id,
        role: 'patient',
        joined_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error('Failed to create membership:', membershipError);
    }

    // Track analytics
    await trackServerEvent('sanctuary_claimed', {
      campaign_id: campaignId,
      user_id,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Error claiming sanctuary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
