// Search limits for free users
export const SEARCH_LIMITS = {
  DAILY_SEARCH_LIMIT: 10,
  EXTREME_SEARCH_LIMIT: 5,
} as const;

export const PRICING = {
  PRO_MONTHLY: 10, // USD
  PRO_MONTHLY_USD: 10, // USD pricing for Stripe
} as const;

export const CURRENCIES = {
  USD: 'USD',
  INR: 'INR',
} as const;

export const SNAPSHOT_NAME = 'scira-analysis:1752127473';
