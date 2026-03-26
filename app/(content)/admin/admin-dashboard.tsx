'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCost } from '@/lib/cost-calculator';
import {
  getCurrentMonthCosts,
  getAllUserCosts,
  type UserCostSummary,
} from '@/app/actions/cost-analysis';

interface MonthCostData {
  totalCost: number;
  userCount: number;
  averageCostPerUser: number;
  topUsers: Array<{ userId: string; cost: number }>;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [monthData, setMonthData] = useState<MonthCostData | null>(null);
  const [allUsers, setAllUsers] = useState<UserCostSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [monthCosts, userCosts] = await Promise.all([
        getCurrentMonthCosts(),
        getAllUserCosts(),
      ]);

      setMonthData(monthCosts);
      setAllUsers(userCosts.sort((a, b) => b.totalCost - a.totalCost));
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate user statistics
  const totalUsers = allUsers.length;
  const proUsers = allUsers.filter(u => u.totalCost > 0).length;
  const freeUsers = totalUsers - proUsers;

  // Calculate total revenue (assuming $10/month per pro user)
  const totalRevenue = proUsers * 10;
  const totalCosts = allUsers.reduce((sum, u) => sum + u.totalCost, 0);
  const thisMonthCost = monthData?.totalCost || 0;
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor costs and user analytics
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {proUsers} Pro • {freeUsers} Free
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month Costs</CardDescription>
            <CardTitle className="text-3xl">{formatCost(thisMonthCost)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Current month API usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>All Time Costs</CardDescription>
            <CardTitle className="text-3xl">{formatCost(totalCosts)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total API usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Revenue</CardDescription>
            <CardTitle className="text-3xl">${totalRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {proUsers} Pro users × $10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit Margin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {profitMargin > 50 ? 'Healthy' : profitMargin > 30 ? 'Moderate' : 'Low'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="models">Model Usage</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Users by Cost</CardTitle>
              <CardDescription>Highest API usage costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allUsers.slice(0, 20).map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.userName || 'Unknown User'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${user.totalCost > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {user.totalCost > 0 ? 'Pro' : 'Free'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.userEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.messageCount} messages • {user.totalTokens.toLocaleString()} tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCost(user.totalCost)}</p>
                      {user.messageCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatCost(user.averageCostPerMessage)}/msg
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Usage Breakdown</CardTitle>
              <CardDescription>Costs by AI model</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const modelTotals: Record<string, { cost: number; count: number }> = {};
                
                allUsers.forEach(user => {
                  user.modelBreakdown.forEach(model => {
                    if (!modelTotals[model.model]) {
                      modelTotals[model.model] = { cost: 0, count: 0 };
                    }
                    modelTotals[model.model].cost += model.cost;
                    modelTotals[model.model].count += model.messageCount;
                  });
                });

                const sortedModels = Object.entries(modelTotals)
                  .sort(([, a], [, b]) => b.cost - a.cost);

                return (
                  <div className="space-y-2">
                    {sortedModels.map(([model, data]) => (
                      <div
                        key={model}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{model}</p>
                          <p className="text-xs text-muted-foreground">
                            {data.count} messages
                          </p>
                        </div>
                        <p className="font-bold">{formatCost(data.cost)}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Complete user list with costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.userName || 'Unknown User'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.totalCost > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {user.totalCost > 0 ? 'Pro' : 'Free'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.userEmail || user.userId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.messageCount} messages • {user.totalTokens.toLocaleString()} tokens
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCost(user.totalCost)}</p>
                      {user.messageCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatCost(user.averageCostPerMessage)}/msg
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
