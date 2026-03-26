'use server';

import { db } from '@/lib/db';
import { message, chat, user } from '@/lib/db/schema';
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
      modelBreakdown,
    };
  } catch (error) {
    console.error('Error calculating user costs:', error);
    throw error;
  }
}

/**
 * Get current month costs
 */
export async function getCurrentMonthCosts() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all users
  const allUsers = await db.select({ id: user.id }).from(user);

  let totalCost = 0;
  let userCount = 0;
  const topUsers: Array<{ userId: string; cost: number }> = [];

  for (const u of allUsers) {
    const userCosts = await calculateUserCosts(u.id, startOfMonth);
    if (userCosts.totalCost > 0) {
      totalCost += userCosts.totalCost;
      userCount += 1;
      topUsers.push({ userId: u.id, cost: userCosts.totalCost });
    }
  }

  topUsers.sort((a, b) => b.cost - a.cost);

  return {
    totalCost,
    userCount,
    averageCostPerUser: userCount > 0 ? totalCost / userCount : 0,
    topUsers: topUsers.slice(0, 10),
  };
}

/**
 * Get all user costs (including free users with $0 usage)
 */
export async function getAllUserCosts(): Promise<UserCostSummary[]> {
  try {
    // Get ALL users from the user table
    const allUsers = await db.select({ id: user.id }).from(user);

    const userCosts: UserCostSummary[] = [];

    for (const u of allUsers) {
      const costs = await calculateUserCosts(u.id);
      userCosts.push(costs);
    }

    return userCosts;
  } catch (error) {
    console.error('Error getting all user costs:', error);
    throw error;
  }
}
