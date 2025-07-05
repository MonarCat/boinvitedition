
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
    console.log('Fetching real financial summary for business:', businessId);
    
    // Get completed bookings with payments
    const { data: completedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('total_amount, payment_status, created_at')
      .eq('business_id', businessId)
      .eq('payment_status', 'completed');
    
    if (bookingsError) throw bookingsError;
    
    // Get payment transactions
    const { data: paymentTransactions, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('amount, status, business_amount, created_at')
      .eq('business_id', businessId)
      .eq('status', 'completed')
      .eq('transaction_type', 'client_to_business');
    
    if (paymentsError) throw paymentsError;
    
    // Get client business transactions
    const { data: clientTransactions, error: clientTxError } = await supabase
      .from('client_business_transactions')
      .select('business_amount, amount, status, created_at')
      .eq('business_id', businessId)
      .eq('status', 'completed');
    
    if (clientTxError) throw clientTxError;
    
    // Calculate total revenue from all sources
    const bookingsRevenue = (completedBookings || [])
      .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
    
    const paymentsRevenue = (paymentTransactions || [])
      .reduce((sum, payment) => sum + Number(payment.business_amount || payment.amount || 0), 0);
    
    const clientTxRevenue = (clientTransactions || [])
      .reduce((sum, tx) => sum + Number(tx.business_amount || 0), 0);
    
    const totalRevenue = bookingsRevenue + paymentsRevenue + clientTxRevenue;
    
    // Get pending amounts
    const { data: pendingBookings, error: pendingError } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('business_id', businessId)
      .eq('payment_status', 'pending');
    
    if (pendingError) throw pendingError;
    
    const pendingAmount = (pendingBookings || [])
      .reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
    
    // Calculate commission and net amounts with KES currency
    const totalFees = calculateCommission(totalRevenue);
    const netAmount = calculateNetAmount(totalRevenue);
    const availableBalance = netAmount - (pendingAmount * 0.95); // 95% of pending after commission
    
    console.log('Real financial summary calculated:', {
      totalRevenue,
      totalFees,
      availableBalance,
      pendingBalance: pendingAmount
    });
    
    return {
      totalRevenue,
      availableBalance: Math.max(0, availableBalance),
      pendingBalance: pendingAmount,
      totalFees,
    };
  } catch (error) {
    console.error('Error fetching real finance summary:', error);
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
    console.log('Fetching real transactions for business:', businessId);
    
    let query = supabase
      .from('bookings')
      .select(`
        id,
        total_amount,
        payment_status,
        created_at,
        customer_name,
        services:service_id(name)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data: bookings, error: bookingsError } = await query;
    if (bookingsError) throw bookingsError;
    
    // Also get payment transactions
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 10);
    
    if (paymentsError) throw paymentsError;
    
    // Combine and format transactions
    const bookingTransactions: Transaction[] = (bookings || []).map(booking => ({
      id: booking.id,
      amount: Number(booking.total_amount || 0),
      type: 'booking_payment' as const,
      status: booking.payment_status === 'completed' ? 'completed' as const : 
              booking.payment_status === 'pending' ? 'pending' as const : 'failed' as const,
      description: `${booking.services?.name || 'Service'} - ${booking.customer_name || 'Customer'}`,
      createdAt: booking.created_at,
    }));
    
    const paymentTransactions: Transaction[] = (payments || []).map(payment => ({
      id: payment.id,
      amount: Number(payment.business_amount || payment.amount || 0),
      type: 'booking_payment' as const,
      status: payment.status === 'completed' ? 'completed' as const : 
              payment.status === 'pending' ? 'pending' as const : 'failed' as const,
      description: `Payment Transaction - ${payment.payment_method || 'Unknown'}`,
      createdAt: payment.created_at,
      reference: payment.paystack_reference,
    }));
    
    // Combine and sort by date
    const allTransactions = [...bookingTransactions, ...paymentTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, options.limit || 10);
    
    console.log('Real transactions fetched:', allTransactions.length);
    return allTransactions;
  } catch (error) {
    console.error('Error fetching real transactions:', error);
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
    // For now, return empty array as withdrawal system isn't fully implemented
    // In production, this would query a withdrawals table
    console.log('Fetching withdrawals for business:', businessId);
    return [];
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
    // For now, return a mock withdrawal as the full withdrawal system isn't implemented
    // In production, this would create a record in a withdrawals table
    console.log('Requesting withdrawal for business:', businessId, 'amount:', amount);
    
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
    // Get business payout settings
    const { data: payoutSettings, error } = await supabase
      .from('business_payouts')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    const accounts: PaymentAccount[] = [];
    
    if (payoutSettings) {
      if (payoutSettings.mpesa_number) {
        accounts.push({
          id: 'mpesa-' + businessId,
          type: 'mpesa',
          isDefault: true,
          phoneNumber: payoutSettings.mpesa_number,
          accountName: payoutSettings.account_holder_name || 'Business Owner',
        });
      }
      
      if (payoutSettings.bank_account_number) {
        accounts.push({
          id: 'bank-' + businessId,
          type: 'bank',
          isDefault: !payoutSettings.mpesa_number, // Default if no M-Pesa
          accountNumber: payoutSettings.bank_account_number,
          bankName: payoutSettings.bank_name,
          accountName: payoutSettings.account_holder_name || 'Business Owner',
        });
      }
    }
    
    console.log('Payment accounts fetched:', accounts.length);
    return accounts;
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
    // Update business payout settings
    const updateData: any = {};
    
    if (details.phoneNumber) {
      updateData.mpesa_number = details.phoneNumber;
    }
    
    if (details.accountNumber) {
      updateData.bank_account_number = details.accountNumber;
    }
    
    if (details.bankName) {
      updateData.bank_name = details.bankName;
    }
    
    if (details.accountName) {
      updateData.account_holder_name = details.accountName;
    }
    
    const { data, error } = await supabase
      .from('business_payouts')
      .upsert({
        business_id: businessId,
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Return updated account
    const updatedAccount: PaymentAccount = {
      id: accountId,
      type: details.type || 'mpesa',
      isDefault: true,
      phoneNumber: data.mpesa_number,
      accountNumber: data.bank_account_number,
      bankName: data.bank_name,
      accountName: data.account_holder_name,
    };
    
    console.log('Payment account updated:', updatedAccount);
    return updatedAccount;
  } catch (error) {
    console.error('Error updating payment account:', error);
    throw error;
  }
};
