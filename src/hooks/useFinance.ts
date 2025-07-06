import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getFinanceSummary, 
  getTransactions, 
  getWithdrawals,
  requestWithdrawal,
  getPaymentAccounts,
  updatePaymentAccount
} from '@/services/financeService';
import { calculateCommission, calculateNetAmount } from '@/utils/format';
import type { 
  FinanceSummary, 
  Transaction, 
  WithdrawalRequest,
  PaymentAccount
} from '@/types/finance';

export const useFinance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);

  const businessId = user?.id || '';

  const loadFinanceSummary = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading REAL financial summary for business:', businessId);
      
      const data = await getFinanceSummary(businessId);
      
      // Calculate real financial metrics from actual bookings data
      const realSummary = {
        ...data,
        totalFees: calculateCommission(data.totalRevenue),
        availableBalance: Math.max(0, calculateNetAmount(data.totalRevenue) - data.pendingBalance)
      };
      
      console.log('REAL Financial summary loaded:', realSummary);
      setSummary(realSummary);
    } catch (err) {
      console.error('Error loading financial summary:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (options = { limit: 10, offset: 0 }) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading REAL transactions for business:', businessId);
      
      const data = await getTransactions(businessId, options);
      console.log('REAL Transactions loaded:', data.length);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async (options = { limit: 10, offset: 0 }) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWithdrawals(businessId, options);
      setWithdrawals(data);
    } catch (err) {
      console.error('Error loading withdrawals:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentAccounts = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getPaymentAccounts(businessId);
      setPaymentAccounts(data);
    } catch (err) {
      console.error('Error loading payment accounts:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawalRequest = async (amount: number, accountId: string) => {
    if (!businessId) return null;
    
    // Validate minimum withdrawal amount in KES
    if (amount < 100) {
      setError(new Error('Minimum withdrawal amount is KES 100'));
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const withdrawal = await requestWithdrawal(businessId, amount, accountId);
      setWithdrawals(prev => [withdrawal, ...prev]);
      return withdrawal;
    } catch (err) {
      console.error('Error creating withdrawal request:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (accountId: string, details: Partial<PaymentAccount>) => {
    if (!businessId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const updated = await updatePaymentAccount(businessId, accountId, details);
      setPaymentAccounts(prev => 
        prev.map(acc => acc.id === accountId ? updated : acc)
      );
      return updated;
    } catch (err) {
      console.error('Error updating payment account:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading with real data fetch
  useEffect(() => {
    if (businessId) {
      console.log('Initializing REAL finance data for business:', businessId);
      loadFinanceSummary();
      loadTransactions();
      loadWithdrawals();
      loadPaymentAccounts();
    }
  }, [businessId]);

  return {
    loading,
    error,
    summary,
    transactions,
    withdrawals,
    paymentAccounts,
    loadFinanceSummary,
    loadTransactions,
    loadWithdrawals,
    loadPaymentAccounts,
    createWithdrawalRequest,
    updateAccount,
  };
};
