/**
 * Cost calculator for AI model usage
 * Calculates costs based on token usage and model pricing
 */

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

// Pricing per 1M tokens (in USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI Models
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'o1-preview': { input: 15, output: 60 },
  'o1-mini': { input: 3, output: 12 },
  
  // Anthropic Models
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 1, output: 5 },
  
  // Google Models
  'gemini-2.0-flash-exp': { input: 0, output: 0 }, // Free tier
  'gemini-exp-1206': { input: 0, output: 0 }, // Free tier
  
  // Default fallback
  'default': { input: 0, output: 0 },
};

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(model: string, usage: TokenUsage): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
  
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Format cost as USD currency
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(cost);
}
