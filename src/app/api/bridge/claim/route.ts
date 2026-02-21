import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface BridgeClaimRequest {
  bridge_id: string;
  user_id: string;
}

interface BridgeClaimResponse {
  success: boolean;
  bridge?: Record<string, unknown>;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BridgeClaimResponse>> {
  try {
    const body: BridgeClaimRequest = await request.json();
    const { bridge_id, user_id } = body;

    if (!bridge_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Bridge ID and user ID are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get bridge campaign to retrieve campaign_id
    const { data: bridge, error: bridgeError } = await supabase
      .from('bridge_campaigns')
      .select('*')
      .eq('id', bridge_id)
      .single();

    if (bridgeError || !bridge) {
      return NextResponse.json(
        { success: false, error: 'Bridge not found' },
        { status: 404 }
      );
    }

    // Update bridge campaign
    const { error: updateError } = await supabase
      .from('bridge_campaigns')
      .update({
        claimed_by: user_id,
        status: 'claimed',
      })
      .eq('id', bridge_id);

    if (updateError) {
      console.error('Failed to claim bridge:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to claim bridge' },
        { status: 500 }
      );
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        campaign_id: bridge.campaign_id,
        user_id,
        role: 'caregiver',
        joined_at: new Date().toISOString(),
      });

    if (membershipError) {
      console.error('Failed to create membership:', membershipError);
    }

    // Track analytics
    await trackServerEvent('bridge_organiser_claimed', {
      bridge_id,
      user_id,
      campaign_id: bridge.campaign_id,
    });

    return NextResponse.json({
      success: true,
      bridge,
    });
  } catch (error) {
    console.error('Error claiming bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
