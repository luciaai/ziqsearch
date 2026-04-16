import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { db } from '@/lib/db';
import { billingCustomer, billingSubscription } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          await handleSubscriptionChange(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const userId = subscription.metadata.userId;

  // Get user ID from customer if not in metadata
  let finalUserId = userId;
  if (!finalUserId) {
    const customer = await db.query.billingCustomer.findFirst({
      where: eq(billingCustomer.stripeCustomerId, customerId),
    });
    finalUserId = customer?.userId || '';
  }

  if (!finalUserId) {
    console.error('No user ID found for subscription:', subscription.id);
    return;
  }

  const subscriptionData = {
    userId: finalUserId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    stripePriceId: subscription.items.data[0]?.price.id || '',
    stripeProductId: subscription.items.data[0]?.price.product as string,
    status: subscription.status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
    cancelAt: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000) : null,
    endedAt: (subscription as any).ended_at ? new Date((subscription as any).ended_at * 1000) : null,
    trialStart: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000) : null,
    trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
    metadata: subscription.metadata,
    discount: subscription.discounts && subscription.discounts.length > 0 ? subscription.discounts[0] : null, // Store first discount/coupon info
  };

  // Upsert subscription
  const existing = await db.query.billingSubscription.findFirst({
    where: eq(billingSubscription.stripeSubscriptionId, subscription.id),
  });

  if (existing) {
    await db
      .update(billingSubscription)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(billingSubscription.stripeSubscriptionId, subscription.id));
  } else {
    await db.insert(billingSubscription).values(subscriptionData);
  }

  console.log('✅ Subscription synced:', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(billingSubscription)
    .set({
      status: 'canceled',
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(billingSubscription.stripeSubscriptionId, subscription.id));

  console.log('✅ Subscription deleted:', subscription.id);
}
