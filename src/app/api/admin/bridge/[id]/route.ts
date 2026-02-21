import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface UpdateBridgeRequest {
  status?: string;
  gofundme_raised_cents?: number;
  gofundme_donor_count?: number;
  [key: string]: unknown;
}

interface BridgeResponse {
  success: boolean;
  bridge?: Record<string, unknown>;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BridgeResponse>> {
  try {
    const supabase = getServiceSupabase();
    const { id } = await params;

    const { data: bridge, error } = await supabase
      .from('bridge_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !bridge) {
      return NextResponse.json(
        { success: false, error: 'Bridge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bridge,
    });
  } catch (error) {
    console.error('Error fetching bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<BridgeResponse>> {
  try {
    const body: UpdateBridgeRequest = await request.json();
    const { id } = await params;

    const supabase = getServiceSupabase();

    const { data: bridge, error } = await supabase
      .from('bridge_campaigns')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !bridge) {
      return NextResponse.json(
        { success: false, error: 'Failed to update bridge' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bridge,
    });
  } catch (error) {
    console.error('Error updating bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
