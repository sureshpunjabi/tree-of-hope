import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface SanctuaryDay {
  id: string;
  campaign_id: string;
  day_number: number;
  title: string;
  content?: string;
  content_markdown?: string;
  reflection_prompt?: string;
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

    // Get campaign by slug first, then by id if it looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    let campaign = null;
    let campaignError = null;

    if (isUUID) {
      const result = await supabase
        .from('campaigns')
        .select('*')
        .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
        .single();
      campaign = result.data;
      campaignError = result.error;
    } else {
      const result = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', campaignId)
        .single();
      campaign = result.data;
      campaignError = result.error;
    }

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

    // Use the actual campaign ID (UUID) for subsequent queries
    const realCampaignId = campaign.id;

    // Get today's sanctuary day content
    let todayContent = null;
    if (dayNumber > 0) {
      const { data: sanctuaryDay } = await supabase
        .from('sanctuary_days')
        .select('*')
        .eq('campaign_id', realCampaignId)
        .eq('day_number', dayNumber)
        .single();

      // Map content_markdown to content for frontend compatibility
      if (sanctuaryDay) {
        todayContent = {
          ...sanctuaryDay,
          content: sanctuaryDay.content_markdown || sanctuaryDay.content || '',
        };
      }
    }

    // Get recent journal entries
    const { data: recentEntries = [] } = await supabase
      .from('journal_entries')
      .select('id, campaign_id, title, created_at')
      .eq('campaign_id', realCampaignId)
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
