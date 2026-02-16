/**
 * Finance-related type definitions
 */

export interface Transaction {
  id: string;
  amount: number;
  type: 'booking_payment' | 'refund' | 'withdrawal' | 'fee' | 'platform_clearance';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  reference?: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  accountDetails: {
    type: 'mpesa' | 'bank';
    phoneNumber?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
  };
}

export interface FinanceSummary {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  totalFees: number;
  platformBalance?: number;
  subscriptionBalance?: number;
}

export interface PaymentAccount {
  id: string;
  type: 'mpesa' | 'bank';
  isDefault: boolean;
  phoneNumber?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface FinanceSettings {
  autoWithdrawalEnabled: boolean;
  autoWithdrawalThreshold: number;
  notificationsEnabled: boolean;
}

/**
 * Platform fee and commission tracking
 */

export interface PlatformTransaction {
  id: string;
  business_id: string;
  booking_id?: string;
  service_amount: number;
  platform_fee_amount: number;
  fee_percentage: number;
  status: 'unpaid' | 'paid' | 'waived';
  transaction_date: string;
  paid_at?: string;
  payment_reference?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlatformPayment {
  id: string;
  business_id: string;
  amount: number;
  platform_fee_paid: number;
  subscription_fee_paid: number;
  payment_method: string;
  paystack_reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PlatformBalanceInfo {
  is_restricted: boolean;
  platform_balance: number;
  subscription_balance: number;
  total_balance: number;
  threshold_amount: number;
  message: string;
}

export interface BusinessPlatformSettings {
  platform_fee_percentage: number;
  platform_balance: number;
  account_status: 'active' | 'restricted' | 'suspended';
  last_platform_payment_date?: string;
}
