import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    campaignId: string;
    id: string;
  }>;
}

interface AppointmentResponse {
  success: boolean;
  appointment?: Record<string, unknown>;
  error?: string;
}

// PATCH - update an appointment record
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AppointmentResponse>> {
  try {
    const { campaignId, id } = await params;
    const body = await request.json();
    const supabase = getServiceSupabase();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(body)
      .eq('id', id)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update appointment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - delete an appointment record
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<AppointmentResponse>> {
  try {
    const { campaignId, id } = await params;
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Failed to delete appointment:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
