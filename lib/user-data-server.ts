import 'server-only';

import { eq, desc } from 'drizzle-orm';
import { billingSubscription, user } from './db/schema';
import { getReadReplica, maindb } from './db';
import { auth } from './auth';
import { headers } from 'next/headers';
import { getCustomInstructionsByUserId, getUserPreferencesByUserId } from './db/queries';
import type { CustomInstructions, UserPreferences, BillingSubscription } from './db/schema';

// Normalized user data type - single source of truth
export type ComprehensiveUserData = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isProUser: boolean;
  subscriptionStatus: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid' | 'none';
  subscription?: {
    id: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt: Date | null;
    trialEnd: Date | null;
  };
};

// Lightweight user auth type for fast checks
export type LightweightUserAuth = {
  userId: string;
  email: string;
  isProUser: boolean;
};

const userDataCache = new Map<string, { data: ComprehensiveUserData; expiresAt: number }>();
const lightweightAuthCache = new Map<string, { data: LightweightUserAuth; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const LIGHTWEIGHT_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Custom instructions cache
const customInstructionsCache = new Map<
  string,
  {
    instructions: CustomInstructions | null;
    timestamp: number;
    ttl: number;
  }
>();
const CUSTOM_INSTRUCTIONS_CACHE_TTL_MS = 5 * 60 * 1000;

// User preferences cache
const userPreferencesCache = new Map<
  string,
  {
    preferences: UserPreferences | null;
    timestamp: number;
    ttl: number;
  }
>();
const USER_PREFERENCES_CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedUserData(userId: string): ComprehensiveUserData | null {
  const cached = userDataCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  if (cached) {
    userDataCache.delete(userId);
  }
  return null;
}

function setCachedUserData(userId: string, data: ComprehensiveUserData): void {
  userDataCache.set(userId, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearUserDataCache(userId: string): void {
  userDataCache.delete(userId);
  lightweightAuthCache.delete(userId);
  customInstructionsCache.delete(userId);
  userPreferencesCache.delete(userId);
}

export function clearAllUserDataCache(): void {
  userDataCache.clear();
  lightweightAuthCache.clear();
  customInstructionsCache.clear();
  userPreferencesCache.clear();
}

function getCachedLightweightAuth(userId: string): LightweightUserAuth | null {
  const cached = lightweightAuthCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  if (cached) {
    lightweightAuthCache.delete(userId);
  }
  return null;
}

function setCachedLightweightAuth(userId: string, data: LightweightUserAuth): void {
  lightweightAuthCache.set(userId, {
    data,
    expiresAt: Date.now() + LIGHTWEIGHT_CACHE_TTL_MS,
  });
}

export async function getCachedCustomInstructionsByUserId(
  userId: string,
  options?: { ttlMs?: number },
): Promise<CustomInstructions | null> {
  const ttlMs = options?.ttlMs ?? CUSTOM_INSTRUCTIONS_CACHE_TTL_MS;
  const cached = customInstructionsCache.get(userId);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.instructions;
  }

  const instructions = await getCustomInstructionsByUserId({ userId });
  customInstructionsCache.set(userId, {
    instructions: instructions ?? null,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  return instructions ?? null;
}

export function clearCustomInstructionsCache(userId?: string): void {
  if (userId) {
    customInstructionsCache.delete(userId);
  } else {
    customInstructionsCache.clear();
  }
}

export async function getCachedUserPreferencesByUserId(
  userId: string,
  options?: { ttlMs?: number },
): Promise<UserPreferences | null> {
  const ttlMs = options?.ttlMs ?? USER_PREFERENCES_CACHE_TTL_MS;
  const cached = userPreferencesCache.get(userId);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.preferences;
  }

  const preferences = await getUserPreferencesByUserId({ userId });
  userPreferencesCache.set(userId, {
    preferences: preferences ?? null,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  return preferences ?? null;
}

export function clearUserPreferencesCache(userId?: string): void {
  if (userId) {
    userPreferencesCache.delete(userId);
  } else {
    userPreferencesCache.clear();
  }
}

/**
 * Lightweight authentication check - fast pro status check
 */
export async function getLightweightUserAuth(): Promise<LightweightUserAuth | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // Check lightweight cache first
    const cached = getCachedLightweightAuth(userId);
    if (cached) {
      return cached;
    }

    // Check if full user data is cached
    const fullCached = getCachedUserData(userId);
    if (fullCached) {
      const lightweightData: LightweightUserAuth = {
        userId: fullCached.id,
        email: fullCached.email,
        isProUser: fullCached.isProUser,
      };
      setCachedLightweightAuth(userId, lightweightData);
      return lightweightData;
    }

    const readDb = getReadReplica();

    // Optimized query: fetch user + subscription in single query
    const result = await readDb
      .select({
        userId: user.id,
        email: user.email,
        subscriptionStatus: billingSubscription.status,
        subscriptionEnd: billingSubscription.currentPeriodEnd,
      })
      .from(user)
      .leftJoin(billingSubscription, eq(billingSubscription.userId, user.id))
      .where(eq(user.id, userId));

    if (!result || result.length === 0) {
      return null;
    }

    const userData = result[0];
    const now = new Date();
    
    // User is pro if they have an active subscription or are in trial
    const isProUser = Boolean(
      userData.subscriptionStatus === 'active' ||
      userData.subscriptionStatus === 'trialing' ||
      (userData.subscriptionStatus === 'past_due' && userData.subscriptionEnd && new Date(userData.subscriptionEnd) > now)
    );

    const lightweightData: LightweightUserAuth = {
      userId: userData.userId,
      email: userData.email,
      isProUser,
    };

    setCachedLightweightAuth(userId, lightweightData);
    return lightweightData;
  } catch (error) {
    console.error('Error in getLightweightUserAuth:', error);
    return null;
  }
}

/**
 * Get comprehensive user data including subscription details
 */
export async function getComprehensiveUserData(): Promise<ComprehensiveUserData | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // Check cache first
    const cached = getCachedUserData(userId);
    if (cached) {
      return cached;
    }

    const readDb = getReadReplica();

    // Fetch user data with subscription
    const userWithSubscription = await readDb
      .select({
        userId: user.id,
        userEmail: user.email,
        userEmailVerified: user.emailVerified,
        userName: user.name,
        userImage: user.image,
        userCreatedAt: user.createdAt,
        userUpdatedAt: user.updatedAt,
        subscriptionId: billingSubscription.id,
        stripeSubscriptionId: billingSubscription.stripeSubscriptionId,
        stripePriceId: billingSubscription.stripePriceId,
        subscriptionStatus: billingSubscription.status,
        currentPeriodStart: billingSubscription.currentPeriodStart,
        currentPeriodEnd: billingSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: billingSubscription.cancelAtPeriodEnd,
        canceledAt: billingSubscription.canceledAt,
        trialEnd: billingSubscription.trialEnd,
      })
      .from(user)
      .leftJoin(billingSubscription, eq(billingSubscription.userId, user.id))
      .where(eq(user.id, userId));

    if (!userWithSubscription || userWithSubscription.length === 0) {
      return null;
    }

    const userData = userWithSubscription[0];
    
    // Find active subscription
    const activeSubscription = userWithSubscription
      .filter((row) => 
        row.subscriptionStatus === 'active' || 
        row.subscriptionStatus === 'trialing'
      )
      .sort((a, b) => {
        if (!a.currentPeriodEnd || !b.currentPeriodEnd) return 0;
        return new Date(b.currentPeriodEnd).getTime() - new Date(a.currentPeriodEnd).getTime();
      })[0];

    const now = new Date();
    let isProUser = false;
    let subscriptionStatus: ComprehensiveUserData['subscriptionStatus'] = 'none';

    if (activeSubscription?.subscriptionStatus) {
      isProUser = true;
      subscriptionStatus = activeSubscription.subscriptionStatus as any;
    } else if (userData.subscriptionStatus === 'past_due' && userData.currentPeriodEnd && new Date(userData.currentPeriodEnd) > now) {
      // Grace period for past_due subscriptions
      isProUser = true;
      subscriptionStatus = 'past_due';
    } else if (userData.subscriptionStatus) {
      subscriptionStatus = userData.subscriptionStatus as any;
    }

    const comprehensiveData: ComprehensiveUserData = {
      id: userData.userId,
      email: userData.userEmail,
      emailVerified: userData.userEmailVerified,
      name: userData.userName,
      image: userData.userImage,
      createdAt: userData.userCreatedAt,
      updatedAt: userData.userUpdatedAt,
      isProUser,
      subscriptionStatus,
    };

    // Add subscription details if exists
    if (activeSubscription || userData.subscriptionId) {
      const sub = activeSubscription || userData;
      comprehensiveData.subscription = {
        id: sub.subscriptionId!,
        stripeSubscriptionId: sub.stripeSubscriptionId!,
        stripePriceId: sub.stripePriceId!,
        status: sub.subscriptionStatus!,
        currentPeriodStart: sub.currentPeriodStart!,
        currentPeriodEnd: sub.currentPeriodEnd!,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        canceledAt: sub.canceledAt,
        trialEnd: sub.trialEnd,
      };
    }

    setCachedUserData(userId, comprehensiveData);
    return comprehensiveData;
  } catch (error) {
    console.error('Error in getComprehensiveUserData:', error);
    return null;
  }
}

// Helper functions for backward compatibility
export async function isUserPro(): Promise<boolean> {
  const userData = await getLightweightUserAuth();
  return userData?.isProUser ?? false;
}

export async function getUserId(): Promise<string | null> {
  const userData = await getLightweightUserAuth();
  return userData?.userId ?? null;
}

export async function getUserEmail(): Promise<string | null> {
  const userData = await getLightweightUserAuth();
  return userData?.email ?? null;
}
