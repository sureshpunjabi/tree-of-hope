import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase';
import { trackServerEvent } from '@/lib/analytics';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

interface CheckoutSessionMetadata {
  campaign_id: string;
  user_id: string;
  monthly_tier: string;
  joining_gift_tier: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify Stripe signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata as CheckoutSessionMetadata;

        if (!metadata || !metadata.campaign_id || !metadata.user_id) {
          console.warn('Incomplete metadata in checkout session');
          break;
        }

        // Get campaign monthly_total from price
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        let monthlyTotalCents = 0;

        for (const item of lineItems.data) {
          if (item.price?.type === 'recurring') {
            monthlyTotalCents = item.price.unit_amount || 0;
            break;
          }
        }

        // Create commitment
        const { data: commitment, error: commitmentError } = await supabase
          .from('commitments')
          .insert({
            campaign_id: metadata.campaign_id,
            user_id: metadata.user_id,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            monthly_tier: metadata.monthly_tier,
            status: 'active',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (commitmentError) {
          console.error('Failed to create commitment:', commitmentError);
          break;
        }

        // Create membership
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            campaign_id: metadata.campaign_id,
            user_id: metadata.user_id,
            role: 'supporter',
            joined_at: new Date().toISOString(),
          });

        if (membershipError) {
          console.error('Failed to create membership:', membershipError);
        }

        // Update campaign supporter count and monthly total
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('supporter_count, monthly_total_cents')
          .eq('id', metadata.campaign_id)
          .single();

        if (campaign) {
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({
              supporter_count: (campaign.supporter_count || 0) + 1,
              monthly_total_cents: (campaign.monthly_total_cents || 0) + monthlyTotalCents,
            })
            .eq('id', metadata.campaign_id);

          if (updateError) {
            console.error('Failed to update campaign:', updateError);
          }
        }

        // Track analytics
        await trackServerEvent('checkout_succeeded', {
          campaign_id: metadata.campaign_id,
          user_id: metadata.user_id,
          monthly_tier: metadata.monthly_tier,
          subscription_id: session.subscription,
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const { error } = await supabase
            .from('commitments')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('Failed to update commitment status:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        const { error } = await supabase
          .from('commitments')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to cancel commitment:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        // Map Stripe status to commitment status
        let commitmentStatus = 'active';
        if (subscription.status === 'past_due') {
          commitmentStatus = 'past_due';
        } else if (subscription.status === 'canceled') {
          commitmentStatus = 'cancelled';
        } else if (subscription.pause_collection) {
          commitmentStatus = 'paused';
        }

        const { error } = await supabase
          .from('commitments')
          .update({ status: commitmentStatus })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update commitment:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
