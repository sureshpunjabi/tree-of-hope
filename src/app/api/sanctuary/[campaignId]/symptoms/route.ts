import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateSymptomRequest {
  user_id: string;
  name: string;
  severity?: number;
  description?: string;
  frequency?: string;
  triggered_by?: string;
}

interface Symptom {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  severity?: number;
  description?: string;
  frequency?: string;
  triggered_by?: string;
  created_at: string;
}

interface SymptomResponse {
  success: boolean;
  symptoms?: Symptom[];
  symptom?: Symptom;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<SymptomResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { campaignId } = await params;

    // Look up campaign by slug
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
      .single();
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
      .from('symptoms')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: symptoms = [], error } = await query.order('created_at', {
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
      symptoms: symptoms || [],
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
      name,
      severity,
      description,
      frequency,
      triggered_by,
    } = body;

    if (!user_id || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Look up campaign by slug
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .or(`slug.eq.${campaignId},id.eq.${campaignId}`)
      .single();
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }
    const realCampaignId = campaign.id;

    // Create symptom
    const { data: symptom, error } = await supabase
      .from('symptoms')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        name,
        severity,
        description,
        frequency,
        triggered_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create symptom:', error);
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
        symptom,
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
