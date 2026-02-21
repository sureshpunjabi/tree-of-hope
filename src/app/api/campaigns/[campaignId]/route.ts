import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  patient_name: string;
  status: string;
  leaf_count: number;
  supporter_count: number;
  monthly_total_cents: number;
  sanctuary_claimed: boolean;
  sanctuary_claimed_by: string | null;
  sanctuary_start_date: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface CampaignResponse {
  success: boolean;
  campaign?: Campaign;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<CampaignResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
