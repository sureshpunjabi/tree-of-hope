import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { trackServerEvent } from '@/lib/analytics';

interface PauseRequest {
  commitment_id: string;
  reason?: string;
  note?: string;
  resume_date?: string;
}

interface PauseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PauseResponse>> {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const body: PauseRequest = await request.json();
    const { commitment_id, reason, note, resume_date } = body;

    if (!commitment_id) {
      return NextResponse.json(
        { success: false, error: 'Commitment ID is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify token and get user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get commitment and verify ownership
    const { data: commitment, error: commitmentError } = await supabase
      .from('commitments')
      .select('*')
      .eq('id', commitment_id)
      .eq('user_id', userData.user.id)
      .single();

    if (commitmentError || !commitment) {
      return NextResponse.json(
        { success: false, error: 'Commitment not found' },
        { status: 404 }
      );
    }

    // Update commitment status to paused
    const { error: updateError } = await supabase
      .from('commitments')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
        paused_until: resume_date,
        resume_date,
      })
      .eq('id', commitment_id);

    if (updateError) {
      console.error('Failed to pause commitment:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to pause commitment' },
        { status: 500 }
      );
    }

    // Pause Stripe subscription if exists
    if (commitment.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(commitment.stripe_subscription_id, {
          pause_collection: {
            behavior: 'mark_uncollectible',
          },
        });
      } catch (stripeError) {
        console.error('Failed to pause Stripe subscription:', stripeError);
      }
    }

    // Track analytics
    await trackServerEvent('commitment_paused', {
      commitment_id,
      user_id: userData.user.id,
      reason,
      resume_date,
    });

    return NextResponse.json({
      success: true,
      message: 'Commitment paused successfully',
    });
  } catch (error) {
    console.error('Error pausing commitment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
