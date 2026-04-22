'use server';

import { db } from '@/lib/db';
import { message, chat, user, apiCostTracking, billingSubscription } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { calculateCost } from '@/lib/cost-calculator';

export interface UserCostSummary {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  totalCost: number;
  messageCount: number;
  totalTokens: number;
  averageCostPerMessage: number;
  isPro: boolean;
  isCoupon: boolean;
  modelBreakdown: Array<{
    model: string;
    cost: number;
    messageCount: number;
  }>;
}

/**
 * Calculate costs for a specific user
 */
export async function calculateUserCosts(userId: string, startDate?: Date): Promise<UserCostSummary> {
  try {
    // Get user info
    const [userData] = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Get all messages for this user with token data
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    const chatIds = userChats.map((c) => c.id);

    if (chatIds.length === 0) {
      return {
        userId,
        userName: userData?.name || null,
        userEmail: userData?.email || null,
        totalCost: 0,
        messageCount: 0,
        totalTokens: 0,
        averageCostPerMessage: 0,
        isPro: false,
        isCoupon: false,
        modelBreakdown: [],
      };
    }

    // Get messages with token usage
    const messages = await db
      .select()
      .from(message)
      .where(
        and(
          sql`${message.chatId} IN ${chatIds}`,
          sql`${message.inputTokens} IS NOT NULL`,
          sql`${message.outputTokens} IS NOT NULL`,
          startDate ? gte(message.createdAt, startDate) : undefined
        )
      );

    let totalCost = 0;
    let totalTokens = 0;
    const modelCosts: Record<string, { cost: number; count: number }> = {};

    for (const msg of messages) {
      if (msg.model && msg.inputTokens && msg.outputTokens) {
        const cost = calculateCost(msg.model, {
          inputTokens: msg.inputTokens,
          outputTokens: msg.outputTokens,
        });

        totalCost += cost;
        totalTokens += msg.inputTokens + msg.outputTokens;

        if (!modelCosts[msg.model]) {
          modelCosts[msg.model] = { cost: 0, count: 0 };
        }
        modelCosts[msg.model].cost += cost;
        modelCosts[msg.model].count += 1;
      }
    }

    const modelBreakdown = Object.entries(modelCosts).map(([model, data]) => ({
      model,
      cost: data.cost,
      messageCount: data.count,
    }));

    return {
      userId,
      userName: userData?.name || null,
      userEmail: userData?.email || null,
      totalCost,
      messageCount: messages.length,
      totalTokens,
      averageCostPerMessage: messages.length > 0 ? totalCost / messages.length : 0,
      isPro: false,
      isCoupon: false,
      modelBreakdown,
    };
  } catch (error) {
    console.error('Error calculating user costs:', error);
    throw error;
  }
}

/**
 * Get current month costs from api_cost_tracking table
 */
export async function getCurrentMonthCosts() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get aggregated costs per user from api_cost_tracking
  const userCosts = await db
    .select({
      userId: apiCostTracking.userId,
      totalCost: sql<number>`SUM(${apiCostTracking.estimatedCost})`,
    })
    .from(apiCostTracking)
    .where(gte(apiCostTracking.createdAt, startOfMonth))
    .groupBy(apiCostTracking.userId);

  const totalCost = userCosts.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const userCount = userCosts.length;
  const topUsers = userCosts
    .map(u => ({ userId: u.userId, cost: u.totalCost || 0 }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    totalCost,
    userCount,
    averageCostPerUser: userCount > 0 ? totalCost / userCount : 0,
    topUsers,
  };
}

/**
 * Get all user costs from api_cost_tracking table
 */
export async function getAllUserCosts(): Promise<UserCostSummary[]> {
  try {
    // Get all users with their cost data
    const costs = await db
      .select({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalCost: sql<number>`COALESCE(SUM(${apiCostTracking.estimatedCost}), 0)`,
        messageCount: sql<number>`COALESCE(COUNT(${apiCostTracking.id}), 0)`,
        totalTokens: sql<number>`COALESCE(SUM(${apiCostTracking.inputTokens} + ${apiCostTracking.outputTokens}), 0)`,
      })
      .from(user)
      .leftJoin(apiCostTracking, eq(user.id, apiCostTracking.userId))
      .groupBy(user.id, user.name, user.email);

    // Get all subscriptions separately
    const subscriptions = await db
      .select({
        userId: billingSubscription.userId,
        status: billingSubscription.status,
        discount: billingSubscription.discount,
        metadata: billingSubscription.metadata,
      })
      .from(billingSubscription);

    // Create a map of subscriptions by userId
    const subMap = new Map(subscriptions.map(s => [s.userId, s]));

    return costs.map(c => {
      const sub = subMap.get(c.userId);
      const isPro = sub?.status === 'active' || 
                    sub?.status === 'trialing' || 
                    sub?.status === 'past_due';
      
      const metadata = sub?.metadata as { manual_grant?: boolean } | null;
      const hasDiscount = sub?.discount !== null;
      const isCoupon = hasDiscount || metadata?.manual_grant === true;

      return {
        userId: c.userId,
        userName: c.userName,
        userEmail: c.userEmail,
        totalCost: c.totalCost || 0,
        messageCount: c.messageCount || 0,
        totalTokens: c.totalTokens || 0,
        averageCostPerMessage: c.messageCount > 0 ? (c.totalCost || 0) / c.messageCount : 0,
        isPro,
        isCoupon,
        modelBreakdown: [], // Can add this later if needed
      };
    });
  } catch (error) {
    console.error('Error getting all user costs:', error);
    throw error;
  }
}

/**
 * Get count of paying Pro users (excluding coupon/manual grants)
 */
export async function getProUserCount(): Promise<{ paying: number; coupon: number; free: number }> {
  try {
    const allUsers = await db.select({ id: user.id }).from(user);
    
    const subscriptions = await db
      .select({
        userId: billingSubscription.userId,
        status: billingSubscription.status,
        metadata: billingSubscription.metadata,
        discount: billingSubscription.discount,
      })
      .from(billingSubscription)
      .where(
        sql`${billingSubscription.status} IN ('active', 'trialing', 'past_due')`
      );

    let payingPro = 0;
    let couponPro = 0;

    for (const sub of subscriptions) {
      const metadata = sub.metadata as { manual_grant?: boolean } | null;
      const hasDiscount = sub.discount !== null;
      
      console.log('Subscription check:', {
        userId: sub.userId,
        status: sub.status,
        hasDiscount,
        hasManualGrant: metadata?.manual_grant === true,
        discount: sub.discount
      });
      
      // Check if user has a coupon via discount field or manual_grant metadata
      if (hasDiscount || metadata?.manual_grant === true) {
        couponPro++;
      } else {
        payingPro++;
      }
    }

    const freeUsers = allUsers.length - payingPro - couponPro;

    return { paying: payingPro, coupon: couponPro, free: freeUsers };
  } catch (error) {
    console.error('Error getting pro user count:', error);
    return { paying: 0, coupon: 0, free: 0 };
  }
}

/**
 * Get model usage breakdown from api_cost_tracking
 */
export async function getModelUsageBreakdown(): Promise<Array<{ model: string; provider: string; cost: number; count: number; totalTokens: number }>> {
  try {
    const modelStats = await db
      .select({
        model: apiCostTracking.model,
        provider: apiCostTracking.provider,
        totalCost: sql<number>`SUM(${apiCostTracking.estimatedCost})`,
        count: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`SUM(${apiCostTracking.inputTokens} + ${apiCostTracking.outputTokens})`,
      })
      .from(apiCostTracking)
      .groupBy(apiCostTracking.model, apiCostTracking.provider);

    return modelStats.map(m => ({
      model: m.model,
      provider: m.provider,
      cost: m.totalCost || 0,
      count: m.count || 0,
      totalTokens: m.totalTokens || 0,
    })).sort((a, b) => b.cost - a.cost);
  } catch (error) {
    console.error('Error getting model usage breakdown:', error);
    return [];
  }
}
