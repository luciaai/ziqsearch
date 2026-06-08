import { db } from '@/lib/db';
import { apiCostTracking } from '@/lib/db/schema';
import { generateId } from 'ai';

// Pricing per 1M tokens (as of April 2026)
const MODEL_PRICING = {
  // OpenAI
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },
  'claude-3-opus-20240229': { input: 15, output: 75 },
  
  // Google
  'gemini-2.0-flash-exp': { input: 0, output: 0 }, // Free tier
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  
  // xAI
  'grok-beta': { input: 5, output: 15 },
  'grok-2-1212': { input: 2, output: 10 },
  
  // DeepSeek
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
} as const;

// External API pricing (per request/search)
const EXTERNAL_API_PRICING = {
  // Search APIs
  'exa-search': 0.005, // $5 per 1000 searches = $0.005 per search
  'tavily-search': 0.01, // $10 per 1000 searches = $0.01 per search
  'firecrawl-scrape': 0.003, // $3 per 1000 scrapes = $0.003 per scrape
  'firecrawl-search': 0.005, // $5 per 1000 searches
  'parallel-search': 0.01, // $10 per 1000 requests
  
  // Data APIs
  'supadata-youtube': 0.002, // $2 per 1000 requests
  'valyu-stock': 0.001, // $1 per 1000 requests
  'coingecko-pro': 0.0005, // $0.50 per 1000 requests (Pro tier)
  'tmdb-api': 0, // Free
  'openweather-api': 0.0001, // Very cheap
  
  // Compute APIs
  'daytona-sandbox': 0.05, // $50 per 1000 executions = $0.05 per execution
  
  // Other
  'amadeus-flight': 0.002, // $2 per 1000 requests
  'google-maps': 0.005, // $5 per 1000 requests
} as const;

type ModelName = keyof typeof MODEL_PRICING;

interface CostTrackingParams {
  userId: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  searchType?: 'normal' | 'extreme' | null;
  messageId?: string;
}

/**
 * Calculate estimated cost for API usage
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model as ModelName];
  
  if (!pricing) {
    // Default fallback pricing for unknown models
    return ((inputTokens / 1_000_000) * 5) + ((outputTokens / 1_000_000) * 15);
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Track API cost for a user's request
 */
export async function trackApiCost(params: CostTrackingParams): Promise<void> {
  const { userId, model, provider, inputTokens, outputTokens, searchType, messageId } = params;
  
  const estimatedCost = calculateCost(model, inputTokens, outputTokens);
  
  try {
    await db.insert(apiCostTracking).values({
      id: generateId(),
      userId,
      model,
      provider,
      inputTokens,
      outputTokens,
      estimatedCost,
      searchType: searchType || null,
      messageId: messageId || null,
    });
  } catch (error) {
    console.error('Failed to track API cost:', error);
    // Don't throw - cost tracking shouldn't break the main flow
  }
}

/**
 * Track external API cost (for non-LLM APIs like Exa, Firecrawl, etc.)
 */
export async function trackExternalApiCost(params: {
  userId: string;
  apiName: keyof typeof EXTERNAL_API_PRICING;
  requestCount?: number;
  messageId?: string;
  searchType?: 'normal' | 'extreme' | null;
}): Promise<void> {
  const { userId, apiName, requestCount = 1, messageId, searchType } = params;
  
  const costPerRequest = EXTERNAL_API_PRICING[apiName];
  const estimatedCost = costPerRequest * requestCount;
  
  try {
    await db.insert(apiCostTracking).values({
      id: generateId(),
      userId,
      model: apiName, // Use API name as "model"
      provider: apiName.split('-')[0], // e.g., "exa", "firecrawl", "tavily"
      inputTokens: requestCount, // Store request count as inputTokens
      outputTokens: 0,
      estimatedCost,
      searchType: searchType || null,
      messageId: messageId || null,
    });
  } catch (error) {
    console.error('Failed to track external API cost:', error);
    // Don't throw - cost tracking shouldn't break the main flow
  }
}

/**
 * Get total API costs for a user in a given time period
 */
export async function getUserApiCosts(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ totalCost: number; requestCount: number }> {
  try {
    const { sql, eq, and, gte, lte } = await import('drizzle-orm');
    
    const conditions = [eq(apiCostTracking.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(apiCostTracking.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(apiCostTracking.createdAt, endDate));
    }
    
    const result = await db
      .select({
        totalCost: sql<number>`COALESCE(SUM(${apiCostTracking.estimatedCost}), 0)`,
        requestCount: sql<number>`COUNT(*)`,
      })
      .from(apiCostTracking)
      .where(and(...conditions));
    
    return {
      totalCost: result[0]?.totalCost || 0,
      requestCount: result[0]?.requestCount || 0,
    };
  } catch (error) {
    console.error('Failed to get user API costs:', error);
    return { totalCost: 0, requestCount: 0 };
  }
}

/**
 * Get monthly API costs for a user
 */
export async function getMonthlyApiCosts(userId: string): Promise<{ totalCost: number; requestCount: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return getUserApiCosts(userId, startOfMonth, endOfMonth);
}

/**
 * Get API cost breakdown by model for a user
 */
export async function getUserCostBreakdown(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Array<{ model: string; totalCost: number; requestCount: number }>> {
  try {
    const { sql, eq, and, gte, lte } = await import('drizzle-orm');
    
    const conditions = [eq(apiCostTracking.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(apiCostTracking.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(apiCostTracking.createdAt, endDate));
    }
    
    const result = await db
      .select({
        model: apiCostTracking.model,
        totalCost: sql<number>`SUM(${apiCostTracking.estimatedCost})`,
        requestCount: sql<number>`COUNT(*)`,
      })
      .from(apiCostTracking)
      .where(and(...conditions))
      .groupBy(apiCostTracking.model);
    
    return result;
  } catch (error) {
    console.error('Failed to get cost breakdown:', error);
    return [];
  }
}
