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
      const data = await getFinanceSummary(businessId);
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (options = { limit: 10, offset: 0 }) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const data = await getTransactions(businessId, options);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async (options = { limit: 10, offset: 0 }) => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const data = await getWithdrawals(businessId, options);
      setWithdrawals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentAccounts = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const data = await getPaymentAccounts(businessId);
      setPaymentAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawalRequest = async (amount: number, accountId: string) => {
    if (!businessId) return null;
    
    try {
      setLoading(true);
      const withdrawal = await requestWithdrawal(businessId, amount, accountId);
      setWithdrawals(prev => [withdrawal, ...prev]);
      setError(null);
      return withdrawal;
    } catch (err) {
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
      const updated = await updatePaymentAccount(businessId, accountId, details);
      setPaymentAccounts(prev => 
        prev.map(acc => acc.id === accountId ? updated : acc)
      );
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (businessId) {
      loadFinanceSummary();
      loadTransactions();
      loadWithdrawals();
      loadPaymentAccounts();
    }
  }, [businessId]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally excluding the load functions from dependencies
  // to avoid infinite render loops, as these functions don't need to be recreated

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
