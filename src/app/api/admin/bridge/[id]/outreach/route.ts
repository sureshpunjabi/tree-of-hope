import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getAuthenticatedUser } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface OutreachRequest {
  channel: string;
  message_summary: string;
}

interface OutreachResponse {
  success: boolean;
  outreach?: Record<string, unknown>;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<OutreachResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: OutreachRequest = await request.json();
    const { id: bridgeId } = await params;
    const { channel, message_summary } = body;

    if (!channel || !message_summary) {
      return NextResponse.json(
        { success: false, error: 'Channel and message_summary are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Create outreach record
    const { data: outreach, error: outreachError } = await supabase
      .from('bridge_outreach')
      .insert({
        bridge_id: bridgeId,
        channel,
        message_summary,
        outreach_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (outreachError) {
      console.error('Failed to create outreach record:', outreachError);
      return NextResponse.json(
        { success: false, error: 'Failed to log outreach' },
        { status: 500 }
      );
    }

    // Increment outreach attempts on bridge_campaigns
    const { data: bridge } = await supabase
      .from('bridge_campaigns')
      .select('outreach_attempts')
      .eq('id', bridgeId)
      .single();

    if (bridge) {
      const { error: updateError } = await supabase
        .from('bridge_campaigns')
        .update({
          outreach_attempts: (bridge.outreach_attempts || 0) + 1,
        })
        .eq('id', bridgeId);

      if (updateError) {
        console.error('Failed to update outreach attempts:', updateError);
      }
    }

    // Track analytics
    await trackServerEvent('bridge_outreach_sent', {
      bridge_id: bridgeId,
      channel,
    });

    return NextResponse.json(
      {
        success: true,
        outreach,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging outreach:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
