
import { supabase } from '@/lib/supabase';
import { calculateCommission, calculateNetAmount } from '@/utils/format';
import type { 
  FinanceSummary, 
  Transaction, 
  WithdrawalRequest,
  PaymentAccount
} from '@/types/finance';

/**
 * Get the financial summary for the current business (KES currency)
 */
export const getFinanceSummary = async (businessId: string): Promise<FinanceSummary> => {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, return mock data with KES calculations
    const mockRevenue = 125000; // KES
    
    return {
      totalRevenue: mockRevenue,
      availableBalance: calculateNetAmount(mockRevenue) - 12500, // Net minus pending
      pendingBalance: 12500, // KES
      totalFees: calculateCommission(mockRevenue), // 5% commission
    };
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    throw error;
  }
};

/**
 * Get transactions for the current business (KES currency)
 */
export const getTransactions = async (
  businessId: string,
  options: { limit?: number; offset?: number; type?: string }
): Promise<Transaction[]> => {
  try {
    // Mock data with KES amounts
    const mockTransactions: Transaction[] = [
      {
        id: 'tx-001',
        amount: 1500, // KES
        type: 'booking_payment',
        status: 'completed',
        description: 'Booking #1001',
        createdAt: '2025-07-03T12:00:00Z',
      },
      {
        id: 'tx-002',
        amount: 3000, // KES
        type: 'booking_payment',
        status: 'completed',
        description: 'Booking #1002',
        createdAt: '2025-07-02T14:30:00Z',
      },
      {
        id: 'tx-003',
        amount: 4500, // KES
        type: 'booking_payment',
        status: 'completed',
        description: 'Booking #1003',
        createdAt: '2025-07-01T09:45:00Z',
      },
    ];
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get withdrawal requests for the current business
 */
export const getWithdrawals = async (
  businessId: string,
  options: { limit?: number; offset?: number }
): Promise<WithdrawalRequest[]> => {
  try {
    // This would normally fetch from your Supabase DB
    // For now we'll return mock data
    const mockWithdrawals: WithdrawalRequest[] = [
      {
        id: 'wd-001',
        amount: 10000,
        status: 'processing',
        createdAt: '2025-06-21T15:00:00Z',
        accountDetails: {
          type: 'mpesa',
          phoneNumber: '+254712345678',
        },
      },
      {
        id: 'wd-002',
        amount: 20000,
        status: 'completed',
        createdAt: '2025-06-22T10:30:00Z',
        processedAt: '2025-06-23T09:15:00Z',
        accountDetails: {
          type: 'mpesa',
          phoneNumber: '+254712345678',
        },
      },
    ];
    return mockWithdrawals;
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    throw error;
  }
};

/**
 * Request a new withdrawal
 */
export const requestWithdrawal = async (
  businessId: string,
  amount: number,
  accountId: string
): Promise<WithdrawalRequest> => {
  try {
    // This would normally create a record in your Supabase DB
    // For now we'll return mock data
    const mockWithdrawal: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      accountDetails: {
        type: 'mpesa',
        phoneNumber: '+254712345678',
      },
    };
    return mockWithdrawal;
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    throw error;
  }
};

/**
 * Get payment accounts for the current business
 */
export const getPaymentAccounts = async (businessId: string): Promise<PaymentAccount[]> => {
  try {
    // This would normally fetch from your Supabase DB
    // For now we'll return mock data
    const mockAccounts: PaymentAccount[] = [
      {
        id: 'acc-001',
        type: 'mpesa',
        isDefault: true,
        phoneNumber: '+254712345678',
        accountName: 'John Doe',
      },
    ];
    return mockAccounts;
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    throw error;
  }
};

/**
 * Update payment account details
 */
export const updatePaymentAccount = async (
  businessId: string,
  accountId: string,
  details: Partial<PaymentAccount>
): Promise<PaymentAccount> => {
  try {
    // This would normally update a record in your Supabase DB
    // For now we'll return mock data
    const mockAccount: PaymentAccount = {
      id: accountId,
      type: 'mpesa',
      isDefault: true,
      phoneNumber: details.phoneNumber || '+254712345678',
      accountName: details.accountName || 'John Doe',
    };
    return mockAccount;
  } catch (error) {
    console.error('Error updating payment account:', error);
    throw error;
  }
};
