import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    campaignId: string;
    id: string;
  }>;
}

interface MedicationResponse {
  success: boolean;
  medication?: Record<string, unknown>;
  error?: string;
}

// PATCH - update a medication record
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MedicationResponse>> {
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

    // Only allow updating specific fields
    const allowedFields = ['is_active', 'name', 'dosage', 'frequency', 'time_of_day', 'notes'];
    const updateData: Record<string, unknown> = {};

    allowedFields.forEach((field) => {
      if (field in body) {
        updateData[field] = body[field];
      }
    });

    const { data: medication, error } = await supabase
      .from('medications')
      .update(updateData)
      .eq('id', id)
      .eq('campaign_id', realCampaignId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update medication:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update medication' },
        { status: 500 }
      );
    }

    if (!medication) {
      return NextResponse.json(
        { success: false, error: 'Medication not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      medication,
    });
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete a medication record
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<MedicationResponse>> {
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
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('campaign_id', realCampaignId);

    if (error) {
      console.error('Failed to delete medication:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete medication' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
