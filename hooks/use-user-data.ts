import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getSubDetails } from '@/app/actions';
import { User } from '@/lib/db/schema';

// Hook for user data
export function useUserData() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        console.log('Fetching user data...');
        const user = await getCurrentUser();
        console.log('User data received:', user);
        // Ensure we never return undefined - React Query requires a value
        const result = user === undefined ? null : user;
        console.log('Final user data result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.log('Returning null due to error');
        return null; // Return null instead of undefined
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - user data doesn't change often
    gcTime: 1000 * 60 * 10, // 10 minutes cache retention
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 2, // Retry failed requests twice
    // Add this to ensure we never return undefined
    select: (data) => {
      console.log('Select function received:', data);
      const result = data === undefined ? null : data;
      console.log('Select function returning:', result);
      return result;
    },
    // Set a default value to prevent undefined errors
    placeholderData: null,
  });
}

// Hook for subscription data with intelligent caching
export function useSubscriptionData(user: User | null) {
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: getSubDetails,
    enabled: !!user, // Only run when user exists
    staleTime: 1000 * 60 * 30, // 30 minutes - Pro status doesn't change frequently
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache retention for subscription data
    refetchOnWindowFocus: false, // Don't refetch on focus
    retry: 1, // Only retry once for subscription checks
  });
}

// Combined hook for Pro user status with optimized caching
export function useProUserStatus() {
  const { data: user, isLoading: userLoading } = useUserData();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscriptionData(user || null);

  const isProUser = subscriptionData?.hasSubscription && subscriptionData?.subscription?.status === 'active';
  const isLoading = userLoading || (user && subscriptionLoading);

  // Helper function to check if user should have unlimited access for specific models
  const shouldBypassLimitsForModel = (selectedModel: string) => {
    // Free unlimited models for registered users
    const freeUnlimitedModels = ['scira-default', 'scira-vision'];
    return user && freeUnlimitedModels.includes(selectedModel);
  };

  return {
    user: (user || null) as User | null,
    subscriptionData,
    isProUser: Boolean(isProUser),
    isLoading: Boolean(isLoading),
    // Pro users should never see limit checks
    shouldCheckLimits: !isLoading && user && !isProUser,
    shouldBypassLimitsForModel,
  };
} 