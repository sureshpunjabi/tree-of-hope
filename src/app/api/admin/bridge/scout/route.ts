import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getAuthenticatedUser } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface ScoutRequest {
  gofundme_url: string;
  gofundme_title: string;
  gofundme_organiser_name: string;
  gofundme_raised_cents: number;
  gofundme_goal_cents: number;
  gofundme_donor_count: number;
  gofundme_category: string;
}

interface ScoutResponse {
  success: boolean;
  bridge?: Record<string, unknown>;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ScoutResponse>> {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ScoutRequest = await request.json();
    const {
      gofundme_url,
      gofundme_title,
      gofundme_organiser_name,
      gofundme_raised_cents,
      gofundme_goal_cents,
      gofundme_donor_count,
      gofundme_category,
    } = body;

    if (!gofundme_url || !gofundme_title || !gofundme_organiser_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Create bridge campaign with status 'scouted'
    const { data: bridge, error } = await supabase
      .from('bridge_campaigns')
      .insert({
        status: 'scouted',
        gofundme_url,
        gofundme_title,
        gofundme_organiser_name,
        gofundme_raised_cents,
        gofundme_goal_cents,
        gofundme_donor_count,
        gofundme_category,
        outreach_attempts: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create bridge:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to scout bridge' },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('bridge_scouted', {
      gofundme_title,
      gofundme_organiser_name,
    });

    return NextResponse.json(
      {
        success: true,
        bridge,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error scouting bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
