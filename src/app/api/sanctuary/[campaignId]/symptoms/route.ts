import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateSymptomRequest {
  user_id: string;
  symptom: string;
  severity?: number;
  notes?: string;
}

interface SymptomLog {
  id: string;
  campaign_id: string;
  user_id: string;
  symptom: string;
  severity?: number;
  notes?: string;
  created_at: string;
}

interface SymptomResponse {
  success: boolean;
  logs?: SymptomLog[];
  log?: SymptomLog;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<SymptomResponse>> {
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
      .from('symptom_logs')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: logs = [], error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch symptoms' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
    });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<SymptomResponse>> {
  try {
    const body: CreateSymptomRequest = await request.json();
    const { campaignId } = await params;
    const {
      user_id,
      symptom,
      severity,
      notes,
    } = body;

    if (!user_id || !symptom) {
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

    // Create symptom log
    const { data: log, error } = await supabase
      .from('symptom_logs')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        symptom,
        severity,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create symptom log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create symptom' },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('tool_used', {
      campaign_id: realCampaignId,
      user_id,
      tool: 'symptoms',
    });

    return NextResponse.json(
      {
        success: true,
        log,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating symptom:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
