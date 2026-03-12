'use client';

import { useEffect } from 'react';
import { useUserData } from '@/hooks/use-user-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type ComprehensiveUserData } from '@/lib/user-data';
import { shouldBypassRateLimits } from '@/ai/providers';

export function useCachedUserData() {
  // Get fresh data from the existing hook
  const { user: freshUser, isLoading: isFreshLoading, error, refetch, isRefetching, ...otherUserData } = useUserData();

  // Cache user data in localStorage
  const [cachedUser, setCachedUser] = useLocalStorage<ComprehensiveUserData | null>('scira-user-data', null);

  // Update cache when fresh data is available
  useEffect(() => {
    if (freshUser && !isFreshLoading) {
      setCachedUser(freshUser);
    }
  }, [freshUser, isFreshLoading, setCachedUser]);

  // Clear cache when user logs out (no fresh user and not loading)
  useEffect(() => {
    if (!freshUser && !isFreshLoading && cachedUser) {
      setCachedUser(null);
    }
  }, [freshUser, isFreshLoading, cachedUser, setCachedUser]);

  // Use cached data if available, otherwise use fresh data
  const user = cachedUser || freshUser;

  // Show loading only if we have no cached data and fresh data is loading
  const isLoading = !cachedUser && isFreshLoading;

  // Recalculate derived properties based on current user data
  const isProUser = Boolean(user?.isProUser);
  const proSource = 'stripe'; // Now using Stripe only
  const subscriptionStatus = user?.subscription?.status || 'none';

  // Helper function to check if user should have unlimited access for specific models
  const shouldBypassLimitsForModel = (selectedModel: string) => {
    return shouldBypassRateLimits(selectedModel, user);
  };

  return {
    // Core user data
    user,
    isLoading,
    error,
    refetch,
    isRefetching,

    // Quick access to commonly used properties
    isProUser,
    proSource,
    subscriptionStatus,

    // Stripe subscription details
    subscription: user?.subscription,
    hasSubscription: Boolean(user?.subscription),

    // Legacy compatibility - removed Polar/Dodo
    polarSubscription: null,
    hasPolarSubscription: false,
    dodoSubscription: null,
    hasDodoSubscription: false,
    dodoExpiresAt: null,
    isDodoExpiring: false,
    isDodoExpired: false,

    // Subscription history - now managed via Stripe portal
    subscriptionHistory: [],

    // Rate limiting helpers
    shouldCheckLimits: Boolean(!isLoading && user && !user.isProUser),
    shouldBypassLimitsForModel,

    // Subscription status checks
    hasActiveSubscription: subscriptionStatus === 'active',
    isSubscriptionCanceled: subscriptionStatus === 'canceled',
    isSubscriptionExpired: false, // Stripe doesn't use 'expired' status
    hasNoSubscription: subscriptionStatus === 'none',

    // Legacy compatibility helpers
    subscriptionData: user?.subscription
      ? {
          hasSubscription: true,
          subscription: {
            id: user.subscription.id,
            productId: user.subscription.stripePriceId,
            status: user.subscription.status,
            currentPeriodStart: user.subscription.currentPeriodStart,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
            canceledAt: user.subscription.canceledAt,
          },
        }
      : { hasSubscription: false },

    // Dodo pro status removed - now using Stripe
    dodoProStatus: null,

    expiresAt: user?.subscription?.currentPeriodEnd || null,

    // Additional utilities
    isCached: Boolean(cachedUser),
    clearCache: () => setCachedUser(null),
  };
}

// Lightweight hook for components that only need to know if user is pro
export function useCachedIsProUser() {
  const { isProUser, isLoading } = useCachedUserData();
  return { isProUser, isLoading };
}

// Hook for components that need subscription status but not all user data
export function useCachedSubscriptionStatus() {
  const {
    subscriptionStatus,
    proSource,
    hasActiveSubscription,
    isSubscriptionCanceled,
    isSubscriptionExpired,
    hasNoSubscription,
    isLoading,
  } = useCachedUserData();

  return {
    subscriptionStatus,
    proSource,
    hasActiveSubscription,
    isSubscriptionCanceled,
    isSubscriptionExpired,
    hasNoSubscription,
    isLoading,
  };
}
