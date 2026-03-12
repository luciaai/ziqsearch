'use client';

/**
 * Client-side billing helpers for Stripe checkout and portal
 */

export async function createCheckoutSession(priceId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Checkout error:', error);
      return null;
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
}

export async function createPortalSession(): Promise<string | null> {
  try {
    const response = await fetch('/api/billing/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Portal error:', error);
      return null;
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Failed to create portal session:', error);
    return null;
  }
}

export async function redirectToCheckout(priceId: string): Promise<void> {
  const url = await createCheckoutSession(priceId);
  if (url) {
    window.location.href = url;
  } else {
    throw new Error('Failed to create checkout session');
  }
}

export async function redirectToPortal(): Promise<void> {
  const url = await createPortalSession();
  if (url) {
    window.location.href = url;
  } else {
    throw new Error('Failed to create portal session');
  }
}
