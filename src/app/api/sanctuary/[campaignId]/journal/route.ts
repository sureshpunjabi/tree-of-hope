import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateJournalRequest {
  user_id: string;
  title: string;
  content: string;
  mood_score?: number;
  is_private?: boolean;
}

interface JournalEntry {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  content: string;
  mood_score?: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalResponse {
  success: boolean;
  entries?: JournalEntry[];
  entry?: JournalEntry;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<JournalResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    // Check if campaignId is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    // Look up campaign by slug or id
    let campaign = null;
    let campaignError = null;
    if (isUUID) {
      const result = await supabase
        .from('campaigns')
        .select('id')
        .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
        .single();
      campaign = result.data;
      campaignError = result.error;
    } else {
      const result = await supabase
        .from('campaigns')
        .select('id')
        .eq('slug', campaignId)
        .single();
      campaign = result.data;
      campaignError = result.error;
    }
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
    const realCampaignId = campaign.id;

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: entries = [], error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: entries || [],
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<JournalResponse>> {
  try {
    const body: CreateJournalRequest = await request.json();
    const { campaignId } = await params;
    const { user_id, title, content, mood_score, is_private = true } = body;

    if (!user_id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if campaignId is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);

    // Look up campaign by slug or id
    let campaign = null;
    let campaignError = null;
    if (isUUID) {
      const result = await supabase
        .from('campaigns')
        .select('id')
        .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
        .single();
      campaign = result.data;
      campaignError = result.error;
    } else {
      const result = await supabase
        .from('campaigns')
        .select('id')
        .eq('slug', campaignId)
        .single();
      campaign = result.data;
      campaignError = result.error;
    }
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
    const realCampaignId = campaign.id;

    // Create journal entry
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        title,
        content,
        mood_score,
        is_private,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create journal entry:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create entry' },
        { status: 500 }
      );
    }

    // Track analytics (no content in event)
    await trackServerEvent('journal_entry_created', {
      campaign_id: realCampaignId,
      user_id,
      mood_score,
    });

    return NextResponse.json(
      {
        success: true,
        entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
