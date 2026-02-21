import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { stripe, STRIPE_PRODUCTS } from '@/lib/stripe';
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

    if (!campaign_id || !user_id || !monthly_tier || !success_url || !cancel_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
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
      if (joiningGiftProduct) {
        lineItems.push({
          price: joiningGiftProduct.priceId,
          quantity: 1,
        });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url,
      cancel_url,
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
