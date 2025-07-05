/**
 * Finance-related type definitions
 */

export interface Transaction {
  id: string;
  amount: number;
  type: 'booking_payment' | 'refund' | 'withdrawal' | 'fee';
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
