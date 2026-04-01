// Search limits for free users
export const SEARCH_LIMITS = {
  DAILY_SEARCH_LIMIT: 7,
  EXTREME_SEARCH_LIMIT: 5,
  MONTHLY_PRO_LIMIT: 500, // Monthly search cap for Pro users
  MONTHLY_STUDENT_LIMIT: 500, // Monthly search cap for Student users
} as const;

export const PRICING = {
  PRO_MONTHLY: 14, // USD
  PRO_MONTHLY_USD: 14, // USD pricing for Stripe
  PRO_YEARLY: 99, // USD - save $69/year
  STUDENT_MONTHLY: 7, // USD - Education discount (50% off)
  STUDENT_YEARLY: 59, // USD - save $25/year
} as const;

export const CURRENCIES = {
  USD: 'USD',
  INR: 'INR',
} as const;

export const SNAPSHOT_NAME = 'scira-analysis:1752127473';
