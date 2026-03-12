import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { billingCustomer } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Stripe customer
    const existingCustomer = await db.query.billingCustomer.findFirst({
      where: eq(billingCustomer.userId, session.user.id),
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'No billing customer found' },
        { status: 404 }
      );
    }

    // Create Stripe Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existingCustomer.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
