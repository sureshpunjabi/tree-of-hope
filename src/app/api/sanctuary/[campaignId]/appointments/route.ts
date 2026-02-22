import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

interface CreateAppointmentRequest {
  user_id: string;
  title: string;
  provider?: string;
  location?: string;
  scheduled_at: string;
  notes?: string;
}

interface Appointment {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  provider?: string;
  location?: string;
  notes?: string;
  scheduled_at: string;
  reminder_sent: boolean;
  created_at: string;
}

interface AppointmentResponse {
  success: boolean;
  appointments?: Appointment[];
  appointment?: Appointment;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<AppointmentResponse>> {
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
      .from('appointments')
      .select('*')
      .eq('campaign_id', realCampaignId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: appointments = [], error } = await query.order(
      'scheduled_at',
      { ascending: true }
    );

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointments: appointments || [],
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse<AppointmentResponse>> {
  try {
    const body: CreateAppointmentRequest = await request.json();
    const { campaignId } = await params;
    const {
      user_id,
      title,
      provider,
      location,
      scheduled_at,
      notes,
    } = body;

    if (!user_id || !title || !scheduled_at) {
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

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        campaign_id: realCampaignId,
        user_id,
        title,
        provider,
        location,
        scheduled_at,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create appointment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // Track analytics
    await trackServerEvent('tool_used', {
      campaign_id: realCampaignId,
      user_id,
      tool: 'appointments',
    });

    return NextResponse.json(
      {
        success: true,
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
