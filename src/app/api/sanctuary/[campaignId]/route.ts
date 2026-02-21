import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface SanctuaryDay {
  id: string;
  campaign_id: string;
  day_number: number;
  title: string;
  content: string;
  created_at: string;
}

interface JournalEntry {
  id: string;
  campaign_id: string;
  title: string;
  created_at: string;
}

interface SanctuaryResponse {
  success: boolean;
  campaign?: Record<string, unknown>;
  today?: {
    dayNumber: number;
    content: SanctuaryDay | null;
  };
  recentEntries?: JournalEntry[];
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<SanctuaryResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Calculate current day
    let dayNumber = 0;
    if (campaign.sanctuary_start_date) {
      const startDate = new Date(campaign.sanctuary_start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Get today's sanctuary day content
    let todayContent = null;
    if (dayNumber > 0) {
      const { data: sanctuaryDay } = await supabase
        .from('sanctuary_days')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('day_number', dayNumber)
        .single();

      todayContent = sanctuaryDay || null;
    }

    // Get recent journal entries
    const { data: recentEntries = [] } = await supabase
      .from('journal_entries')
      .select('id, campaign_id, title, created_at')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      campaign,
      today: {
        dayNumber,
        content: todayContent,
      },
      recentEntries: recentEntries || [],
    });
  } catch (error) {
    console.error('Error fetching sanctuary data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
