import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiCostTracking, user, billingSubscription } from '@/lib/db/schema';
import { sql, eq, gte, desc } from 'drizzle-orm';
import { UserCostRow } from './user-cost-row';

// Admin email - only this user can access
const ADMIN_EMAIL = 'esawalk@gmail.com';

interface ApiCall {
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: string;
}

interface UserCostData {
  userId: string;
  email: string;
  name: string;
  isPro: boolean;
  monthlyRevenue: number;
  monthlyCost: number;
  profit: number;
  searchCount: number;
  status: 'profit' | 'break-even' | 'loss';
  apiCalls: ApiCall[];
}

async function getUserCosts(): Promise<UserCostData[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all users with their subscription status
  const users = await db
    .select({
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus: billingSubscription.status,
      stripePriceId: billingSubscription.stripePriceId,
    })
    .from(user)
    .leftJoin(billingSubscription, eq(user.id, billingSubscription.userId));

  // Get costs for each user this month
  const costs = await db
    .select({
      userId: apiCostTracking.userId,
      totalCost: sql<number>`COALESCE(SUM(${apiCostTracking.estimatedCost}), 0)`,
      searchCount: sql<number>`COUNT(*)`,
    })
    .from(apiCostTracking)
    .where(gte(apiCostTracking.createdAt, startOfMonth))
    .groupBy(apiCostTracking.userId);

  // Get detailed API calls for each user
  const allApiCalls = await db
    .select({
      userId: apiCostTracking.userId,
      model: apiCostTracking.model,
      provider: apiCostTracking.provider,
      inputTokens: apiCostTracking.inputTokens,
      outputTokens: apiCostTracking.outputTokens,
      cost: apiCostTracking.estimatedCost,
      timestamp: apiCostTracking.createdAt,
    })
    .from(apiCostTracking)
    .where(gte(apiCostTracking.createdAt, startOfMonth))
    .orderBy(desc(apiCostTracking.createdAt));

  // Group API calls by user
  const apiCallsByUser = new Map<string, ApiCall[]>();
  allApiCalls.forEach((call) => {
    if (!apiCallsByUser.has(call.userId)) {
      apiCallsByUser.set(call.userId, []);
    }
    apiCallsByUser.get(call.userId)!.push({
      model: call.model,
      provider: call.provider,
      inputTokens: call.inputTokens,
      outputTokens: call.outputTokens,
      cost: call.cost,
      timestamp: call.timestamp.toISOString(),
    });
  });

  // Combine data
  const costMap = new Map(costs.map((c) => [c.userId, c]));

  const userData: UserCostData[] = users
    .filter((u) => {
      // Only show users who have cost data (have actually used the app this month)
      return costMap.has(u.userId);
    })
    .map((u) => {
      // Match the same Pro logic as getLightweightUserAuth
      const isPro = u.subscriptionStatus === 'active' || 
                    u.subscriptionStatus === 'trialing' || 
                    u.subscriptionStatus === 'past_due';
      
      // Check if this is a coupon/manual Pro user (free Pro)
      const isCouponUser = u.stripePriceId === 'price_manual_pro';
      
      // Coupon users generate $0 revenue, paying users generate $14
      const monthlyRevenue = isPro && !isCouponUser ? 14 : 0;
      
      const costData = costMap.get(u.userId);
      const monthlyCost = costData?.totalCost || 0;
      const searchCount = costData?.searchCount || 0;
      const profit = monthlyRevenue - monthlyCost;

      let status: 'profit' | 'break-even' | 'loss';
      if (profit > 2) status = 'profit';
      else if (profit >= -2) status = 'break-even';
      else status = 'loss';

      return {
        userId: u.userId,
        email: u.email,
        name: u.name,
        isPro,
        monthlyRevenue,
        monthlyCost,
        profit,
        searchCount,
        status,
        apiCalls: apiCallsByUser.get(u.userId) || [],
      };
    });

  // Sort by profit (lowest first - biggest losers at top)
  return userData.sort((a, b) => a.profit - b.profit);
}

export default async function AdminCostsPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  // Check if user is admin
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const userCosts = await getUserCosts();

  // Calculate totals
  const totalRevenue = userCosts.reduce((sum, u) => sum + u.monthlyRevenue, 0);
  const totalCosts = userCosts.reduce((sum, u) => sum + u.monthlyCost, 0);
  const totalProfit = totalRevenue - totalCosts;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">� Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage costs and user feedback</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          <Link 
            href="/admin/costs"
            className="px-4 py-2 font-medium border-b-2 border-primary text-primary"
          >
            💰 Costs
          </Link>
          <Link 
            href="/admin/feedback"
            className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted"
          >
            📬 Feedback
          </Link>
        </div>

        <p className="text-muted-foreground mb-2">See who&apos;s making or losing you money this month</p>
        <p className="text-sm text-muted-foreground mb-8">💡 Click any row to see detailed API usage</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {userCosts.filter((u) => u.isPro).length} Pro users
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Costs</div>
            <div className="text-3xl font-bold text-red-600">${totalCosts.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {userCosts.reduce((sum, u) => sum + u.searchCount, 0)} API calls
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
            <div
              className={`text-3xl font-bold ${
                totalProfit > 0 ? 'text-green-600' : totalProfit < 0 ? 'text-red-600' : 'text-yellow-600'
              }`}
            >
              ${totalProfit.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalProfit > 0 ? '✅ Making money' : totalProfit < 0 ? '❌ Losing money' : '⚠️ Breaking even'}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Plan</th>
                  <th className="text-right p-4 font-medium">Searches</th>
                  <th className="text-right p-4 font-medium">Revenue</th>
                  <th className="text-right p-4 font-medium">Costs</th>
                  <th className="text-right p-4 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {userCosts.map((userData) => (
                  <UserCostRow key={userData.userId} {...userData} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-sm font-medium mb-2">Legend:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔴</span>
              <span>Losing money (profit &lt; -$2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🟡</span>
              <span>Breaking even (-$2 to $2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🟢</span>
              <span>Making profit (&gt; $2)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
