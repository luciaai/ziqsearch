import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const STRIPE_CONFIG = {
  priceIds: {
    proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    proYearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;
