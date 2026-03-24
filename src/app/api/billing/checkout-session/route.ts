import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRODUCTS, CommitmentType } from '@/lib/stripe';
import { IS_STRIPE_CONFIGURED, STRIPE_DEMO_MESSAGE } from '@/lib/stripe-config';
import { LEGACY_TIER_MAP } from '@/lib/stripe-products';

// Easter Minimum: Two products only. Recurring. No one-off payments. Ever.

interface CheckoutRequest {
  campaign_id: string;
  commitment_type: CommitmentType;
  success_url: string;
  cancel_url: string;
}

interface CheckoutResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
  demo?: boolean;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CheckoutResponse>> {
  try {
    const body = await request.json();
    let {
      campaign_id,
      commitment_type,
      success_url,
      cancel_url,
    } = body as CheckoutRequest;

    // Backward compatibility: map old tier names to new ones
    if (!commitment_type && body.monthly_tier) {
      const mapped = LEGACY_TIER_MAP[body.monthly_tier];
      commitment_type = mapped || 'leaf';
    }

    if (!campaign_id || !commitment_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate commitment type
    const product = STRIPE_PRODUCTS[commitment_type];
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Invalid commitment type' },
        { status: 400 }
      );
    }

    // Demo mode: Stripe not configured
    if (!IS_STRIPE_CONFIGURED) {
      return NextResponse.json(
        { success: false, error: STRIPE_DEMO_MESSAGE, demo: true },
        { status: 503 }
      );
    }

    // Validate that Stripe price ID is configured
    if (!product.priceId) {
      return NextResponse.json(
        { success: false, error: 'Stripe price ID is not configured for this tier. Please set STRIPE_PRICE_* environment variables.' },
        { status: 500 }
      );
    }

    // Fallback URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tree-of-hope-olive.vercel.app';
    const finalSuccessUrl = success_url || `${baseUrl}/c/${campaign_id}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancel_url || `${baseUrl}/c/${campaign_id}/commitment`;

    // Create Stripe checkout session — subscription mode, single recurring line item
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        campaign_id,
        commitment_type,
      },
    });

    if (!session.id) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
