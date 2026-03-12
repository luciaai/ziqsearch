import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/app/actions';
import { type ComprehensiveUserData } from '@/lib/user-data';
import { shouldBypassRateLimits } from '@/ai/providers';

export function useUserData() {
  const {
    data: userData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['comprehensive-user-data'],
    queryFn: getCurrentUser,
    // Keep this aggressively fresh so subscription changes reflect quickly
    staleTime: 5 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Helper function to check if user should have unlimited access for specific models
  const shouldBypassLimitsForModel = (selectedModel: string) => {
    return shouldBypassRateLimits(selectedModel, userData);
  };

  return {
    // Core user data
    user: userData,
    isLoading,
    error,
    refetch,
    isRefetching,

    // Quick access to commonly used properties
    isProUser: Boolean(userData?.isProUser),
    proSource: 'stripe', // Now using Stripe only
    subscriptionStatus: userData?.subscription?.status || 'none',

    // Stripe subscription details
    subscription: userData?.subscription,
    hasSubscription: Boolean(userData?.subscription),

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
    shouldCheckLimits: !isLoading && userData && !userData.isProUser,
    shouldBypassLimitsForModel,

    // Subscription status checks
    hasActiveSubscription: userData?.subscription?.status === 'active',
    isSubscriptionCanceled: userData?.subscription?.status === 'canceled',
    isSubscriptionExpired: false, // Stripe doesn't use 'expired' status
    hasNoSubscription: !userData?.subscription,

    // Legacy compatibility helpers
    subscriptionData: userData?.subscription
      ? {
          hasSubscription: true,
          subscription: {
            id: userData.subscription.id,
            productId: userData.subscription.stripePriceId,
            status: userData.subscription.status,
            currentPeriodStart: userData.subscription.currentPeriodStart,
            currentPeriodEnd: userData.subscription.currentPeriodEnd,
            cancelAtPeriodEnd: userData.subscription.cancelAtPeriodEnd,
            canceledAt: userData.subscription.canceledAt,
          },
        }
      : { hasSubscription: false },

    // Dodo pro status removed - now using Stripe
    dodoProStatus: null,

    expiresAt: userData?.subscription?.currentPeriodEnd || null,
  };
}

// Lightweight hook for components that only need to know if user is pro
export function useIsProUser() {
  const { isProUser, isLoading } = useUserData();
  return { isProUser, isLoading };
}

// Hook for components that need subscription status but not all user data
export function useSubscriptionStatus() {
  const {
    subscriptionStatus,
    proSource,
    hasActiveSubscription,
    isSubscriptionCanceled,
    isSubscriptionExpired,
    hasNoSubscription,
    isLoading,
  } = useUserData();

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

// Export the comprehensive type for components that need it
export type { ComprehensiveUserData };
