/**
 * Platform balance and commission configuration constants
 */

// Commission rate (percentage)
export const PLATFORM_COMMISSION_RATE = 5; // 5% Pay As You Go fee

// Balance thresholds in KES
export const PLATFORM_BALANCE_RESTRICTION_THRESHOLD = 1000; // KES 1,000 starting limit
export const PLATFORM_BALANCE_WARNING_RATIO = 0.7; // Show warning at 70% of restriction threshold (KES 700)

// Free trial duration in days
export const FREE_TRIAL_DAYS = 14;

// Subscription defaults
export const DEFAULT_MONTHLY_SUBSCRIPTION_FEE = 0; // KES 0 for commission-only model

// Payment configurations
export const PLATFORM_PAYMENT_CURRENCY = "KES";
export const PLATFORM_PAYMENT_METHOD = "paystack";
