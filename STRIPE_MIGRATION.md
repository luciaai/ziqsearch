# Stripe Migration Progress

## ✅ Completed Steps

### 1. Installed Stripe SDK
- Added `stripe` and `@stripe/stripe-js` packages
- Created `/lib/stripe.ts` wrapper with Stripe client configuration

### 2. Created Normalized Billing Schema
Added new tables to `/lib/db/schema.ts`:
- `billingCustomer` - Maps users to Stripe customers
- `billingSubscription` - Stores Stripe subscription data
- Added relations and type exports

### 3. Removed Polar & Dodo from Auth
Updated `/lib/auth.ts`:
- Removed all Polar SDK imports and client initialization
- Removed all Dodo Payments imports and client initialization
- Removed Polar and Dodo plugins from Better Auth configuration
- Removed webhook handlers for Polar and Dodo
- Auth now only handles authentication (social providers + sessions)

Updated `/lib/auth-client.ts`:
- Removed `polarClient()` and `dodopaymentsClient()` plugins
- Client now only uses `lastLoginMethodClient()`

### 4. Created Stripe Billing API Routes
- `/app/api/billing/checkout/route.ts` - Creates Stripe Checkout sessions
- `/app/api/billing/portal/route.ts` - Creates Stripe Billing Portal sessions
- `/app/api/webhooks/stripe/route.ts` - Handles Stripe webhooks for subscription lifecycle

### 5. Updated Environment Validation
- Updated `/env/server.ts` to add Stripe secret keys
- Updated `/env/client.ts` to add Stripe publishable key
- Created `.env.example` with all required variables

### 6. Created New User Data Helpers
- Created `/lib/user-data-server-new.ts` with normalized subscription state
- Removed `proSource`, `polarSubscription`, `dodoSubscription` fields
- Added single `subscription` field with Stripe data
- Simplified pro status checks to use Stripe subscription status

### 7. Created Client-Side Billing Helpers
- Created `/lib/billing-client.ts` with helper functions:
  - `createCheckoutSession()` - Initiates Stripe checkout
  - `createPortalSession()` - Opens Stripe billing portal
  - `redirectToCheckout()` - Convenience redirect function
  - `redirectToPortal()` - Convenience redirect function

## 🔄 Next Steps (You Need to Complete)

### 1. Add Stripe Environment Variables
Add these to your `.env` file:
```bash
# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after setting up webhook endpoint
STRIPE_PRICE_PRO_MONTHLY=price_...  # Create in Stripe Dashboard
STRIPE_PRICE_PRO_YEARLY=price_...  # Optional

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

### 2. Set Up Stripe Dashboard
1. Create products and prices in Stripe Dashboard
2. Copy price IDs to environment variables above
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Add these webhook events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
6. Enable Customer Portal in Stripe Dashboard settings

### 3. Run Database Migration
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Replace Old User Data Helpers
Rename files to switch to new implementation:
```bash
mv lib/user-data-server.ts lib/user-data-server-old.ts
mv lib/user-data-server-new.ts lib/user-data-server.ts
```

### 5. Update UI Components (Manual)
You'll need to manually update these files to use Stripe:

**Pricing Page** (`app/pricing/page.tsx`):
- Import `redirectToCheckout` from `/lib/billing-client`
- Replace Polar/Dodo checkout calls with:
  ```typescript
  import { redirectToCheckout } from '@/lib/billing-client';
  
  // In your component:
  await redirectToCheckout(STRIPE_PRICE_PRO_MONTHLY);
  ```

**Settings UI** (wherever you show subscription management):
- Import `redirectToPortal` from `/lib/billing-client`
- Replace Polar/Dodo portal calls with:
  ```typescript
  import { redirectToPortal } from '@/lib/billing-client';
  
  // In your component:
  await redirectToPortal();
  ```

### 6. Remove Old Dependencies
After everything is working with Stripe:
```bash
npm uninstall @polar-sh/better-auth @polar-sh/sdk @dodopayments/better-auth dodopayments
```

### 7. Clean Up Old Files
After verifying everything works:
```bash
rm lib/user-data-server-old.ts
rm lib/db/queries.ts  # If it only contains Polar/Dodo queries
```

## 📋 Migration Checklist

- [x] Install Stripe SDK
- [x] Create Stripe wrapper (`lib/stripe.ts`)
- [x] Add normalized billing tables to schema
- [x] Remove Polar/Dodo from Better Auth
- [x] Create Stripe checkout API route
- [x] Create Stripe portal API route
- [x] Create Stripe webhook handler
- [ ] Add Stripe environment variables
- [ ] Update environment validation
- [ ] Remove Polar client from auth-client.ts
- [ ] Update user data helpers
- [ ] Refactor pricing page
- [ ] Update settings UI
- [ ] Run database migrations
- [ ] Test checkout flow
- [ ] Test webhook handling
- [ ] Test billing portal
- [ ] Remove old dependencies
- [ ] Update documentation

## 🔧 Configuration Required

### Stripe Dashboard Setup
1. Create products and prices in Stripe Dashboard
2. Copy price IDs to environment variables
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`
5. Enable Billing Portal in Stripe Dashboard settings

### Database Migration
After adding environment variables, run:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## ⚠️ Breaking Changes

### For Existing Users
- Existing Polar/Dodo subscriptions will need to be migrated manually
- Recommend soft migration: keep old subscriptions read-only, new purchases via Stripe
- Update user data queries to check both old and new subscription tables during transition

### API Changes
- Checkout now uses `/api/billing/checkout` instead of Polar/Dodo auth plugins
- Portal now uses `/api/billing/portal` instead of Polar/Dodo auth plugins
- Webhooks now at `/api/webhooks/stripe` instead of auth plugin webhooks

## 📝 Notes

- Better Auth now only handles authentication (no billing)
- All billing logic is decoupled and handled via dedicated Stripe routes
- Single source of truth for subscription state (`billingSubscription` table)
- Cleaner separation of concerns between auth and billing
