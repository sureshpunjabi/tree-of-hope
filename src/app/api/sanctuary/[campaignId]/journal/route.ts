import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateJournalRequest {
  user_id: string;
  title: string;
  content: string;
  mood_score?: number;
  sanctuary_day?: number;
}

interface JournalEntry {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  content: string;
  mood_score?: number;
  sanctuary_day?: number;
  created_at: string;
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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('campaign_id', campaignId);

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
    const { user_id, title, content, mood_score, sanctuary_day } = body;

    if (!user_id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Create journal entry
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        campaign_id: campaignId,
        user_id,
        title,
        content,
        mood_score,
        sanctuary_day,
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
      campaign_id: campaignId,
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
