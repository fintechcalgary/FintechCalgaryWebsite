/**
 * Cost tracking utilities for Gemini API usage
 * Helps maintain budget under $1/month
 */

// Gemini Flash pricing (approximate)
const GEMINI_FLASH_COST_PER_1K_TOKENS = 0.00025; // $0.00025 per 1K tokens
const MONTHLY_BUDGET = 1.00; // $1/month budget

// Average tokens per request (estimated)
const AVG_TOKENS_PER_CHAT_REQUEST = 800; // ~400 input + ~400 output
const AVG_TOKENS_PER_SUMMARY = 200; // ~100 input + ~100 output

/**
 * Calculate monthly usage limits based on budget
 */
export function calculateMonthlyLimits() {
  const totalTokensAllowed = (MONTHLY_BUDGET / GEMINI_FLASH_COST_PER_1K_TOKENS) * 1000;
  
  return {
    totalTokensAllowed: Math.floor(totalTokensAllowed),
    maxChatRequests: Math.floor(totalTokensAllowed / AVG_TOKENS_PER_CHAT_REQUEST),
    maxSummaries: Math.floor(totalTokensAllowed / AVG_TOKENS_PER_SUMMARY),
    budget: MONTHLY_BUDGET,
    costPer1KTokens: GEMINI_FLASH_COST_PER_1K_TOKENS
  };
}

/**
 * Track usage and warn when approaching budget
 */
export class CostTracker {
  constructor() {
    this.usage = this.loadUsage();
    this.limits = calculateMonthlyLimits();
  }

  loadUsage() {
    try {
      const stored = localStorage.getItem('gemini_usage_tracking');
      if (stored) {
        const data = JSON.parse(stored);
        // Reset if new month
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (data.month !== currentMonth) {
          return { month: currentMonth, chatRequests: 0, summaries: 0, totalTokens: 0 };
        }
        return data;
      }
    } catch (e) {}
    return { 
      month: new Date().toISOString().slice(0, 7), 
      chatRequests: 0, 
      summaries: 0, 
      totalTokens: 0 
    };
  }

  saveUsage() {
    try {
      localStorage.setItem('gemini_usage_tracking', JSON.stringify(this.usage));
    } catch (e) {}
  }

  trackChatRequest() {
    this.usage.chatRequests += 1;
    this.usage.totalTokens += AVG_TOKENS_PER_CHAT_REQUEST;
    this.saveUsage();
    return this.getStatus();
  }

  trackSummary() {
    this.usage.summaries += 1;
    this.usage.totalTokens += AVG_TOKENS_PER_SUMMARY;
    this.saveUsage();
    return this.getStatus();
  }

  getStatus() {
    const costSoFar = (this.usage.totalTokens / 1000) * GEMINI_FLASH_COST_PER_1K_TOKENS;
    const budgetUsed = (costSoFar / MONTHLY_BUDGET) * 100;

    return {
      ...this.usage,
      budget: MONTHLY_BUDGET,
      costSoFar: parseFloat(costSoFar.toFixed(4)),
      budgetUsed: parseFloat(budgetUsed.toFixed(1)),
      remainingBudget: parseFloat((MONTHLY_BUDGET - costSoFar).toFixed(4)),
      remainingChatRequests: Math.max(0, this.limits.maxChatRequests - this.usage.chatRequests),
      remainingSummaries: Math.max(0, this.limits.maxSummaries - this.usage.summaries),
      isNearLimit: budgetUsed > 80,
      isAtLimit: budgetUsed >= 95,
    };
  }

  canMakeRequest(type = 'chat') {
    const status = this.getStatus();
    if (status.isAtLimit) return false;
    
    if (type === 'chat') {
      return status.remainingChatRequests > 0;
    } else if (type === 'summary') {
      return status.remainingSummaries > 0;
    }
    return true;
  }
}

/**
 * Get recommended rate limits for cost control
 */
export function getRecommendedRateLimits() {
  const limits = calculateMonthlyLimits();
  const daysInMonth = 30;
  
  // Distribute requests evenly across month
  const dailyChatLimit = Math.floor(limits.maxChatRequests / daysInMonth);
  const hourlyChatLimit = Math.floor(dailyChatLimit / 24);
  
  return {
    // Conservative rate limits (80% of calculated to leave buffer)
    dailyChatRequests: Math.floor(dailyChatLimit * 0.8),
    hourlyChatRequests: Math.max(1, Math.floor(hourlyChatLimit * 0.8)),
    requestsPerMinute: Math.max(1, Math.floor((hourlyChatLimit * 0.8) / 60)),
    requestsPer5Minutes: Math.max(2, Math.floor((hourlyChatLimit * 0.8) / 12))
  };
}
