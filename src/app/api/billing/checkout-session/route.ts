import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe';
import { IS_STRIPE_CONFIGURED, STRIPE_DEMO_MESSAGE } from '@/lib/stripe-config';
import { trackServerEvent } from '@/lib/analytics';

interface CheckoutRequest {
  campaign_id: string;
  user_id: string;
  monthly_tier: string;
  joining_gift_tier?: string;
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
    const body: CheckoutRequest = await request.json();
    const {
      campaign_id,
      user_id,
      monthly_tier,
      joining_gift_tier,
      success_url,
      cancel_url,
    } = body;

    if (!campaign_id || !monthly_tier) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Map tier names to Stripe price IDs
    const monthlyProduct = STRIPE_PRODUCTS.monthlyTiers[monthly_tier as keyof typeof STRIPE_PRODUCTS.monthlyTiers];
    if (!monthlyProduct) {
      return NextResponse.json(
        { success: false, error: 'Invalid monthly tier' },
        { status: 400 }
      );
    }

    // Validate that Stripe price IDs are configured
    if (!monthlyProduct.priceId) {
      return NextResponse.json(
        { success: false, error: 'Stripe price IDs are not configured. Please set STRIPE_PRICE_* environment variables.' },
        { status: 500 }
      );
    }

    const lineItems: Array<{
      price: string;
      quantity: number;
    }> = [
      {
        price: monthlyProduct.priceId,
        quantity: 1,
      },
    ];

    // Add joining gift if provided
    if (joining_gift_tier) {
      const joiningGiftProduct = STRIPE_PRODUCTS.joiningGifts[joining_gift_tier as keyof typeof STRIPE_PRODUCTS.joiningGifts];
      if (joiningGiftProduct && joiningGiftProduct.priceId) {
        lineItems.push({
          price: joiningGiftProduct.priceId,
          quantity: 1,
        });
      }
    }

    // Fallback URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tree-of-hope-olive.vercel.app';
    const finalSuccessUrl = success_url || `${baseUrl}/c/${campaign_id}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancel_url || `${baseUrl}/c/${campaign_id}/commitment`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        campaign_id,
        user_id,
        monthly_tier,
        joining_gift_tier: joining_gift_tier || '',
      },
    });

    if (!session.id) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Track the checkout session creation
    await trackServerEvent('checkout_started', {
      campaign_id,
      user_id,
      session_id: session.id,
      monthly_tier,
      joining_gift_tier,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    await trackServerEvent('checkout_started', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
