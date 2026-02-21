import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  leaf_count: number;
  supporter_count: number;
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

interface ApiResponse {
  campaign: Campaign | null;
  leaves: Leaf[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { slug } = await params;

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (campaignError) {
      return NextResponse.json(
        { campaign: null, leaves: [], error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch public leaves
    const { data: leaves = [], error: leavesError } = await supabase
      .from('leaves')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('is_public', true)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (leavesError) {
      return NextResponse.json(
        {
          campaign: null,
          leaves: [],
          error: 'Failed to fetch leaves',
        },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      campaign: {
        ...campaign,
        leaf_count: campaign.leaf_count || 0,
        supporter_count: campaign.supporter_count || 0,
      },
      leaves: leaves || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { campaign: null, leaves: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
