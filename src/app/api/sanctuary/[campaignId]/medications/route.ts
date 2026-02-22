import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateMedicationRequest {
  user_id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  reason?: string;
  start_date?: string;
  end_date?: string;
  prescriber?: string;
}

interface Medication {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  reason?: string;
  start_date?: string;
  end_date?: string;
  prescriber?: string;
  created_at: string;
}

interface MedicationResponse {
  success: boolean;
  medications?: Medication[];
  medication?: Medication;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<MedicationResponse>> {
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
      .from('medications')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: medications = [], error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch medications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      medications: medications || [],
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<MedicationResponse>> {
  try {
    const body: CreateMedicationRequest = await request.json();
    const { campaignId } = await params;
    const {
      user_id,
      name,
      dosage,
      frequency,
      reason,
      start_date,
      end_date,
      prescriber,
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

    // Create medication
    const { data: medication, error } = await supabase
      .from('medications')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        name,
        dosage,
        frequency,
        reason,
        start_date,
        end_date,
        prescriber,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create medication:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create medication' },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('tool_used', {
      campaign_id: realCampaignId,
      user_id,
      tool: 'medications',
    });

    return NextResponse.json(
      {
        success: true,
        medication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
