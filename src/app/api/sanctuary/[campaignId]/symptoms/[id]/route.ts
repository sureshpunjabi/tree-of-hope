import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    campaignId: string;
    id: string;
  }>;
}

interface SymptomResponse {
  success: boolean;
  log?: Record<string, unknown>;
  error?: string;
}

// PATCH - update a symptom log record
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SymptomResponse>> {
  try {
    const { campaignId, id } = await params;
    const body = await request.json();
    const supabase = getServiceSupabase();

    // Resolve slug to campaign UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const campaignQuery = isUUID
      ? supabase.from('campaigns').select('id').or(`slug.eq.${campaignId},id.eq.${campaignId}`).single()
      : supabase.from('campaigns').select('id').eq('slug', campaignId).single();
    const { data: campaign } = await campaignQuery;
    if (!campaign) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const realCampaignId = campaign.id;

    const { data: log, error } = await supabase
      .from('symptom_logs')
      .update(body)
      .eq('id', id)
      .eq('campaign_id', realCampaignId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update symptom log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update symptom log' },
        { status: 500 }
      );
    }

    if (!log) {
      return NextResponse.json(
        { success: false, error: 'Symptom log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Error updating symptom log:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete a symptom log record
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SymptomResponse>> {
  try {
    const { campaignId, id } = await params;
    const supabase = getServiceSupabase();

    // Resolve slug to campaign UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId);
    const campaignQuery = isUUID
      ? supabase.from('campaigns').select('id').or(`slug.eq.${campaignId},id.eq.${campaignId}`).single()
      : supabase.from('campaigns').select('id').eq('slug', campaignId).single();
    const { data: campaign } = await campaignQuery;
    if (!campaign) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const realCampaignId = campaign.id;

    const { error } = await supabase
      .from('symptom_logs')
      .delete()
      .eq('id', id)
      .eq('campaign_id', realCampaignId);

    if (error) {
      console.error('Failed to delete symptom log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete symptom log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting symptom log:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
