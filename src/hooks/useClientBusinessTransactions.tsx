import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for real-time client-to-business transaction data
 * Updated with enhanced real-time capabilities and auto-refresh
 */
export const useClientBusinessTransactions = (businessId?: string) => {
  const queryClient = useQueryClient();
  const [latestTransactions, setLatestTransactions] = useState<any[]>([]);
  const [manualRefreshTrigger, setManualRefreshTrigger] = useState(Date.now());
  
  // Direct real-time subscriptions with immediate data updates
  useEffect(() => {
    if (!businessId) return;
    
    console.log('Setting up REALTIME transaction subscriptions for business:', businessId);
    
    // Create channel for realtime updates
    const channel = supabase.channel('realtime-transactions-' + businessId);
    
    // Subscribe to transaction table changes
    channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'client_business_transactions',
          filter: `business_id=eq.${businessId}`
        }, 
        async (payload) => {
          console.log('REALTIME: Transaction change detected!', payload);
          
          // Immediately update the local state with the new data
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('client_business_transactions')
              .select(`
                *,
                businesses(name, currency),
                bookings(booking_date, booking_time, services(name))
              `)
              .order('created_at', { ascending: false })
              .eq('business_id', businessId);
              
            if (data) {
              console.log('REALTIME: Updated transactions data:', data.length, 'records');
              setLatestTransactions(data);
              setManualRefreshTrigger(Date.now()); // Force refetch
            }
          }
          
          // Also force a refetch to ensure all data is in sync
          queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
        }
      )
      // Also subscribe to bookings table for payment status changes
      // This will catch ANY booking update that results in payment_status=completed
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${businessId}`
        },
        async (payload) => {
          // Only care about bookings with completed payments
          const newRecord = payload.new as { id: string; payment_status?: string };
          if (newRecord && newRecord.payment_status === 'completed') {
            console.log('REALTIME: Booking payment completed, refreshing transactions');
            
            // Check if this booking already has a transaction record
            const { data: existingTransaction } = await supabase
              .from('client_business_transactions')
              .select('id')
              .eq('booking_id', newRecord.id)
              .maybeSingle();
              
            if (!existingTransaction) {
              console.log('REALTIME: Booking payment completed without transaction record, doing full refresh');
              // This booking doesn't have a transaction record yet, do a more thorough refresh
              setLatestTransactions([]); // Clear cache to force fresh fetch
            }
            
            queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setManualRefreshTrigger(Date.now());
          }
        }
      )
      // Also subscribe to payment_transactions table
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `business_id=eq.${businessId}`
        },
        async () => {
          console.log('REALTIME: Payment transaction updated, refreshing data');
          queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
          
          // Immediately fetch the latest data
          const { data } = await supabase
            .from('client_business_transactions')
            .select(`
              *,
              businesses(name, currency),
              bookings(booking_date, booking_time, services(name))
            `)
            .order('created_at', { ascending: false })
            .eq('business_id', businessId);
            
          if (data) {
            setLatestTransactions(data);
            setManualRefreshTrigger(Date.now());
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up realtime subscriptions');
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);

  // Use React Query but with a shorter stale time and our manual refresh trigger
  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['client-business-transactions', businessId, manualRefreshTrigger],
    queryFn: async () => {
      if (!businessId) return [];

      console.log('Fetching client-business-transactions data...');
      
      // If we already have latest transactions from realtime updates and not forcing refresh, use those
      if (latestTransactions.length > 0 && Date.now() - manualRefreshTrigger < 1000) {
        console.log('Using cached realtime transactions:', latestTransactions.length);
        return latestTransactions;
      }

      try {
        // First, try to fetch from client_business_transactions table (primary source)
        const { data: transData, error: transError } = await supabase
          .from('client_business_transactions')
          .select(`
            *,
            businesses(name, currency),
            bookings(booking_date, booking_time, services(name))
          `)
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (transError) {
          throw transError;
        }
        
        // Then, as a backup check, look at bookings with completed payments that might be missing
        // This helps catch any data inconsistencies where bookings were paid but transactions weren't created
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            business_id,
            client_id,
            service_id,
            booking_date,
            booking_time,
            payment_status,
            total_amount,
            payment_reference,
            created_at
          `)
          .eq('business_id', businessId)
          .eq('payment_status', 'completed')
          .order('created_at', { ascending: false });
        
        // If there was an error fetching bookings, we'll just use transactions data
        if (!bookingError && bookingData) {
          // Find any completed bookings that don't have corresponding transactions
          const bookingIds = bookingData.map(b => b.id);
          const transactionBookingIds = transData?.map(t => t.booking_id) || [];
          const missingBookings = bookingIds.filter(id => !transactionBookingIds.includes(id));
          
          if (missingBookings.length > 0) {
            console.log(`Found ${missingBookings.length} completed bookings without transactions`);
            // We could potentially add logic here to create the missing transactions
            // or alert the user that there's data inconsistency
          }
        }
        
        console.log('Fetched transactions:', transData?.length || 0, 'records');
        return transData || [];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
    },
    enabled: !!businessId,
    staleTime: 30 * 1000, // 30 seconds - much shorter
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const { data: payoutSettings } = useQuery({
    queryKey: ['business-payout-settings', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('business_payouts')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Calculate totals with more accurate tracking
  const getTotalRevenue = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);
  };

  const getPendingAmount = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.business_amount || 0), 0);
  };
  
  // Calculate platform fees (5% of total transaction amount)
  const getPlatformFees = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.platform_fee || 0), 0);
  };
  
  // Calculate total gross revenue (before platform fees)
  const getGrossRevenue = () => {
    if (!transactions) return 0;
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  };
  
  // Enhanced refetch function that triggers realtime update and performs deep data check
  const forceRefresh = async () => {
    console.log('Forcing transaction data refresh with deep check');
    
    try {
      // Force a deep refresh by setting a new timestamp
      setManualRefreshTrigger(Date.now());
      
      // Clear cached data to force fresh fetch from database
      setLatestTransactions([]);
      
      // Deep validation: Check for any bookings with completed payments that might not have transactions
      if (businessId) {
        try {
          // First, get all completed bookings
          const { data: completedBookings } = await supabase
            .from('bookings')
            .select('id, business_id, client_id, total_amount, payment_status, created_at')
            .eq('business_id', businessId)
            .eq('payment_status', 'completed')
            .order('created_at', { ascending: false });
          
          if (completedBookings && completedBookings.length > 0) {
            console.log(`Found ${completedBookings.length} completed bookings for deep validation`);
            
            // Then get all transactions to compare
            const { data: allTransactions } = await supabase
              .from('client_business_transactions')
              .select('id, booking_id, status')
              .eq('business_id', businessId);
            
            // Map transactions by booking ID for easy lookup
            const transactionsByBookingId = {};
            allTransactions?.forEach(t => {
              if (t.booking_id) {
                transactionsByBookingId[t.booking_id] = t;
              }
            });
            
            // Check each completed booking to see if it has a transaction
            let missingCount = 0;
            completedBookings.forEach(booking => {
              if (!transactionsByBookingId[booking.id]) {
                missingCount++;
                console.log(`Missing transaction for completed booking: ${booking.id}`);
              }
            });
            
            if (missingCount > 0) {
              console.log(`Found ${missingCount} completed bookings without corresponding transactions`);
            }
          }
        } catch (validationError) {
          console.error('Error during deep validation:', validationError);
          // Continue with regular refresh even if deep validation fails
        }
      }
      
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['client-business-transactions', businessId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payment_transactions'] });
      
      // Perform the refetch
      return await refetch();
    } catch (error) {
      console.error('Force refresh failed:', error);
      throw error;
    }
  };

  return {
    transactions: transactions || [],
    payoutSettings,
    isLoading,
    refetch: forceRefresh, // Replace standard refetch with our enhanced version
    totalRevenue: getTotalRevenue(),
    pendingAmount: getPendingAmount(),
    platformFees: getPlatformFees(),
    grossRevenue: getGrossRevenue(),
    lastUpdated: new Date(), // Include timestamp of when data was last calculated
  };
};
