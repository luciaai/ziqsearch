// Force dynamic rendering to access headers
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/app/actions';
import PricingTable from './_component/pricing-table';

export default async function PricingPage() {
  const user = await getCurrentUser();

  // Extract subscription details from unified user data
  const subscriptionDetails = user?.subscription
    ? {
        hasSubscription: true,
        subscription: {
          id: user.subscription.id,
          productId: user.subscription.stripePriceId,
          status: user.subscription.status,
          amount: 0,
          currency: 'USD',
          recurringInterval: 'month',
          currentPeriodStart: user.subscription.currentPeriodStart,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          canceledAt: user.subscription.canceledAt,
          organizationId: null,
        },
      }
    : { hasSubscription: false };

  return (
    <div className="w-full">
      <PricingTable subscriptionDetails={subscriptionDetails} user={user} />
    </div>
  );
}
