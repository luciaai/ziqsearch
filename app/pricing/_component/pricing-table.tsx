'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { redirectToCheckout, redirectToPortal } from '@/lib/billing-client';
import { ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRICING, SEARCH_LIMITS } from '@/lib/constants';
import { getDiscountConfigAction } from '@/app/actions';
import { DiscountConfig } from '@/lib/discount';
import { ComprehensiveUserData } from '@/lib/user-data-server';
import { SciraLogo } from '@/components/logos/scira-logo';

type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: 'CANCELED' | 'EXPIRED' | 'GENERAL';
};

interface PricingTableProps {
  subscriptionDetails: SubscriptionDetailsResult;
  user: ComprehensiveUserData | null;
}

export default function PricingTable({ subscriptionDetails, user }: PricingTableProps) {
  const router = useRouter();
  const userEmail = user?.email?.toLowerCase() ?? '';

  const [discountConfig, setDiscountConfig] = useState<DiscountConfig>({
    enabled: false,
    isStudentDiscount: false,
  });

  useEffect(() => {
    const fetchDiscountConfig = async () => {
      try {
        const config = await getDiscountConfigAction({
          email: user?.email,
          isIndianUser: false,
        });

        setDiscountConfig(config as DiscountConfig);
      } catch (error) {
        console.error('Failed to fetch discount config:', error);
      }
    };

    fetchDiscountConfig();
  }, [user?.email]);

  const hasStudentDiscount = () => {
    return discountConfig.enabled && discountConfig.isStudentDiscount;
  };

  const getStudentPrice = () => {
    if (!discountConfig.enabled || !discountConfig.isStudentDiscount) {
      return null;
    }
    return discountConfig.finalPrice || 7;
  };

  const handleCheckout = async (_productId: string, _slug: string, _paymentMethod?: 'dodo' | 'polar') => {
    if (!user) {
      router.push('/sign-up');
      return;
    }

    try {
      // Use Stripe checkout
      toast.loading('Redirecting to checkout...');

      // Get the appropriate price ID based on location
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
      
      if (!priceId) {
        toast.dismiss();
        toast.error('Pricing configuration error. Please contact support.');
        return;
      }

      // Show success message for student discount if applicable
      if (hasStudentDiscount()) {
        toast.dismiss();
        toast.success('🎓 Student discount applied!');
      }

      // Redirect to Stripe checkout
      await redirectToCheckout(priceId);
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Use Stripe billing portal
      await redirectToPortal();
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  // Check if user has active subscription (simplified for Stripe)
  const hasProAccess = () => {
    return user?.isProUser === true;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between h-14 px-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <SciraLogo className="size-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-lg font-light tracking-tighter font-be-vietnam-pro">ziq</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <p className="text-xs text-muted-foreground tracking-wide mb-3">Plans</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground font-be-vietnam-pro mb-4">
            Pricing
          </h1>
          <p className="text-base text-muted-foreground">
            Choose the plan that works for you
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-background p-8 flex flex-col">
            <h3 className="text-lg font-medium mb-2 text-foreground">Free</h3>
            <p className="text-sm text-muted-foreground mb-6">Get started with essential features</p>
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-light tracking-tight text-foreground font-be-vietnam-pro">$0</span>
              <span className="text-sm text-muted-foreground ml-2">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                {SEARCH_LIMITS.DAILY_SEARCH_LIMIT} searches per day
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                Basic AI models
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-foreground/40 mt-2 shrink-0" />
                Search history
              </li>
            </ul>

            <Button variant="outline" className="w-full h-11 rounded-none" disabled={!hasProAccess()}>
              {!hasProAccess() ? 'Current plan' : 'Free plan'}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-muted/20 p-8 flex flex-col relative">
            {hasProAccess() && (
              <div className="absolute top-4 right-4">
                <span className="text-[10px] uppercase tracking-wider text-foreground border border-foreground px-2 py-1">
                  Current
                </span>
              </div>
            )}
            {!hasProAccess() && hasStudentDiscount() && (
              <div className="absolute top-4 right-4">
                <span className="text-[10px] uppercase tracking-wider text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 px-2 py-1">
                  Academic
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-medium text-foreground">Pro</h3>
              {!hasProAccess() && !hasStudentDiscount() && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">Everything for serious research</p>

            {/* Pricing Display */}
            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-light tracking-tight text-foreground font-be-vietnam-pro">${PRICING.PRO_MONTHLY_USD}</span>
                <span className="text-sm text-muted-foreground ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                Unlimited searches
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                All AI models
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                PDF analysis
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                Priority support
              </li>
              <li className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="w-1 h-1 rounded-full bg-foreground mt-2 shrink-0" />
                Ziq Lookout
              </li>
            </ul>

            {hasProAccess() ? (
              <div className="space-y-3">
                <Button className="w-full h-11 rounded-none" onClick={handleManageSubscription}>
                  Manage subscription
                </Button>
                {user?.subscription && (
                  <p className="text-xs text-muted-foreground text-center">
                    {user.subscription.cancelAtPeriodEnd
                      ? `Expires ${formatDate(user.subscription.currentPeriodEnd)}`
                      : `Renews ${formatDate(user.subscription.currentPeriodEnd)}`}
                  </p>
                )}
              </div>
            ) : !user ? (
              <Button className="w-full h-11 rounded-none group" onClick={() => handleCheckout('', '', undefined)}>
                Sign up for Pro
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 rounded-none group"
                  onClick={() => handleCheckout('', '', undefined)}
                >
                  {hasStudentDiscount() ? '🎓 Upgrade with academic discount' : 'Upgrade to Pro'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Credit/Debit Cards (auto-renews monthly)
                </p>
                {hasStudentDiscount() && discountConfig.message && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                    {discountConfig.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Academic Discount Section */}
        {!hasStudentDiscount() && (
          <div className="max-w-3xl mx-auto mt-8 p-6 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium mb-1">Academic discount available</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get Pro for just $7/month! Sign up with your university or academic institution email (.edu)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Don't have a .edu email?{' '}
                    <Link href="/request-education-discount" className="text-foreground hover:underline font-medium">
                      Request education discount
                    </Link>
                    {' '}(homeschoolers, international students, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Discount Active */}
        {hasStudentDiscount() && !hasProAccess() && (
          <div className="max-w-3xl mx-auto mt-8 p-6 border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-start gap-4">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium mb-1 text-green-700 dark:text-green-300">Academic discount active</h3>
                <p className="text-xs text-muted-foreground">
                  Your academic email has been recognized. Get Pro for ${getStudentPrice()}/month. Discount applied automatically at checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="max-w-3xl mx-auto mt-16 text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            By subscribing, you agree to our{' '}
            <Link href="/terms" className="text-foreground hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-foreground hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Questions?{' '}
            <a href="mailto:ziqsearch@gmail.com" className="text-foreground hover:underline">
              ziqsearch@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <SciraLogo className="size-4" />
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Ziq</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
