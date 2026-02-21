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
  created_at: string;
}

interface Leaf {
  id: string;
  campaign_id: string;
  author_name: string;
  message: string;
  position_x: number;
  position_y: number;
  is_public: boolean;
  created_at: string;
}

interface BridgeResponse {
  success: boolean;
  campaign?: Record<string, unknown>;
  bridge?: BridgeCampaign;
  leaves?: Leaf[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BridgeResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { slug } = await params;

    // Fetch campaign by slug
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('slug', slug)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch bridge campaign data
    const { data: bridge } = await supabase
      .from('bridge_campaigns')
      .select('*')
      .eq('campaign_id', campaign.id)
      .single();

    // Fetch leaves
    const { data: leaves = [] } = await supabase
      .from('leaves')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      campaign,
      bridge: bridge || undefined,
      leaves: leaves || [],
    });
  } catch (error) {
    console.error('Error fetching bridge campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
