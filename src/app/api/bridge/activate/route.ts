import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe';
import { IS_STRIPE_CONFIGURED, STRIPE_DEMO_MESSAGE } from '@/lib/stripe-config';
import { trackServerEvent } from '@/lib/analytics';

interface BridgeActivateRequest {
  campaign_id: string;
  author_name: string;
  message: string;
  email: string;
  monthly_tier: string;
  joining_gift_tier?: string;
  success_url: string;
  cancel_url: string;
}

interface BridgeActivateResponse {
  success: boolean;
  checkout_url?: string;
  leaf_id?: string;
  error?: string;
}

// Leaf placement algorithm (same as in campaigns/leaves)
function calculateLeafPosition(leafIndex: number): { x: number; y: number } {
  const angleStep = 137.5;
  const radiusStep = 30;
  const centerX = 500;
  const centerY = 300;

  const angle = (leafIndex * angleStep * Math.PI) / 180;
  const radius = Math.sqrt(leafIndex) * radiusStep;

  const x = Math.round(centerX + radius * Math.cos(angle));
  const y = Math.round(centerY + radius * Math.sin(angle));

  return { x, y };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BridgeActivateResponse>> {
  try {
    const body: BridgeActivateRequest = await request.json();
    const {
      campaign_id,
      author_name,
      message,
      email,
      monthly_tier,
      joining_gift_tier,
      success_url,
      cancel_url,
    } = body;

    if (!campaign_id || !author_name || !message || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Create leaf
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('leaf_count')
      .eq('id', campaign_id)
      .single();

    const currentLeafCount = campaignData?.leaf_count || 0;
    const { x: position_x, y: position_y } =
      calculateLeafPosition(currentLeafCount);

    const { data: leaf, error: leafError } = await supabase
      .from('leaves')
      .insert({
        campaign_id,
        author_name,
        message,
        is_public: true,
        is_hidden: false,
        position_x,
        position_y,
      })
      .select()
      .single();

    if (leafError) {
      console.error('Failed to create leaf:', leafError);
      return NextResponse.json(
        { success: false, error: 'Failed to create leaf' },
        { status: 500 }
      );
    }

    // Increment leaf count
    await supabase
      .from('campaigns')
      .update({ leaf_count: currentLeafCount + 1 })
      .eq('id', campaign_id);

    // Demo mode: Stripe not configured — still create the leaf but skip checkout
    if (!IS_STRIPE_CONFIGURED) {
      await trackServerEvent('bridge_activated', {
        campaign_id,
        author_name,
        monthly_tier,
        demo: true,
      });

      return NextResponse.json({
        success: true,
        leaf_id: leaf.id,
        demo: true,
        demo_message: STRIPE_DEMO_MESSAGE,
      });
    }

    // Create checkout session — Easter Minimum: map legacy tier to leaf/sponsor
    const { LEGACY_TIER_MAP } = await import('@/lib/stripe-products');
    const commitmentType = LEGACY_TIER_MAP[monthly_tier] || 'leaf';
    const product = STRIPE_PRODUCTS[commitmentType];
    if (!product || !product.priceId) {
      return NextResponse.json(
        { success: false, error: 'Invalid commitment type' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: {
        campaign_id,
        commitment_type: commitmentType,
      },
    });

    // Track analytics
    await trackServerEvent('bridge_activated', {
      campaign_id,
      author_name,
      monthly_tier,
    });

    return NextResponse.json({
      success: true,
      checkout_url: session.url || undefined,
      leaf_id: leaf.id,
    });
  } catch (error) {
    console.error('Error activating bridge:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
