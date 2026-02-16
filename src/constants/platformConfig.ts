/**
 * Platform balance and commission configuration constants
 */

// Commission rate (percentage)
export const PLATFORM_COMMISSION_RATE = 3; // 3%

// Balance thresholds in KES
export const PLATFORM_BALANCE_RESTRICTION_THRESHOLD = 5000; // KES 5,000
export const PLATFORM_BALANCE_WARNING_RATIO = 0.4; // Show warning at 40% of restriction threshold (KES 2,000)

// Subscription defaults
export const DEFAULT_MONTHLY_SUBSCRIPTION_FEE = 0; // KES 0 for commission-only model

// Payment configurations
export const PLATFORM_PAYMENT_CURRENCY = "KES";
export const PLATFORM_PAYMENT_METHOD = "paystack";
