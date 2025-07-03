import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DataRefreshPanelProps {
  businessId: string;
}

export function DataRefreshPanel({ businessId }: DataRefreshPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const queryClient = useQueryClient();
  
  // Set up an auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !businessId) return;
    
    // Create an interval to refresh data every 15 seconds
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing dashboard data');
      
      try {
        // Quietly invalidate queries without showing the refresh UI
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            // Handle both array and non-array query keys
            const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
            return (
              queryKey === 'dashboard-stats' || 
              queryKey === 'client-business-transactions' ||
              queryKey === 'bookings' || 
              queryKey === 'clients' ||
              queryKey === 'payment_transactions'
            );
          }
        });
      } catch (error) {
        console.error('Auto-refresh error (non-critical):', error);
        // Don't show errors for auto-refresh - just log them
      }
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, queryClient, businessId]);

  const refreshAllData = async () => {
    if (!businessId || isRefreshing) return;
    
    setIsRefreshing(true);
    setStatus(null);
    setMessage('Refreshing data...');
    
    try {
      console.log('Starting dashboard data refresh');
      
      // Invalidate all relevant queries first to mark them for refetching
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return (
            queryKey === 'dashboard-stats' || 
            queryKey === 'client-business-transactions' ||
            queryKey === 'bookings' || 
            queryKey === 'bookings-list' ||
            queryKey === 'clients' ||
            queryKey === 'payment_transactions'
          );
        }
      });

      // Make direct Supabase calls to warm the cache
      try {
        // Make direct database calls to force refresh cache
        const supabasePromises = [
          // Fetch latest transactions
          supabase
            .from('client_business_transactions')
            .select('id')
            .eq('business_id', businessId)
            .limit(1),
            
          // Fetch latest bookings  
          supabase
            .from('bookings')
            .select('id')
            .eq('business_id', businessId)
            .limit(1),
            
          // Fetch latest clients
          supabase
            .from('clients')
            .select('id')
            .eq('business_id', businessId)
            .limit(1),
            
          // Fetch latest payment transactions  
          supabase
            .from('payment_transactions')
            .select('id')
            .eq('business_id', businessId)
            .limit(1)
        ];
        
        // Execute all requests in parallel to warm up the cache
        await Promise.all(supabasePromises);
        
        console.log('Successfully refreshed database cache');
      } catch (dbError) {
        console.error('Database refresh error (non-critical):', dbError);
        // Continue even if this fails - it's just a cache warm-up
      }
      
      // Force refetch all queries
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['dashboard-stats'] }),
          queryClient.refetchQueries({ queryKey: ['client-business-transactions'] }),
          queryClient.refetchQueries({ queryKey: ['business-data'] }),
          queryClient.refetchQueries({ queryKey: ['payment_transactions'] })
        ]);
        
        setStatus('success');
        setMessage('Data refreshed successfully!');
      } catch (refetchError) {
        console.error('Error during query refetch:', refetchError);
        setStatus('error');
        setMessage('Some data may not have refreshed. Try again.');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setStatus('error');
      setMessage(`Failed to refresh: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Data Sync Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1">
                Having trouble seeing recent payments or bookings?
              </p>
              <p className="text-xs text-gray-600">
                Try refreshing your data to sync with the latest information.
              </p>
              
              {status === 'success' && (
                <div className="mt-2 text-xs flex items-center text-green-600 gap-1">
                  <CheckCircle className="h-3 w-3" /> {message}
                </div>
              )}
              
              {status === 'error' && (
                <div className="mt-2 text-xs flex items-center text-red-600 gap-1">
                  <AlertTriangle className="h-3 w-3" /> {message}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={refreshAllData}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync Now
                  </>
                )}
              </Button>
              
              {/* Advanced refresh button - forces a complete data reload */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsRefreshing(true);
                  setMessage('Performing deep refresh...');
                  
                  try {
                    // Force a complete query cache reset
                    queryClient.removeQueries({
                      predicate: (query) => {
                        // If any query key contains business data, remove it
                        const queryKey = Array.isArray(query.queryKey) ? query.queryKey : [query.queryKey];
                        const businessRelatedKeys = [
                          'dashboard-stats',
                          'client-business-transactions',
                          'bookings',
                          'clients',
                          'payment_transactions',
                          'business-data'
                        ];
                        
                        return businessRelatedKeys.some(key => queryKey.includes(key)) || 
                               queryKey.some(k => k === businessId);
                      }
                    });
                    
                    // Delay the refresh to ensure the cache is cleared
                    setTimeout(() => {
                      refreshAllData();
                    }, 500);
                  } catch (error) {
                    console.error('Error during force reload:', error);
                    setStatus('error');
                    setMessage('Failed to perform deep refresh. Try again.');
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
              >
                Force Reload
              </Button>
            </div>
          </div>
          
          {/* Auto-refresh toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-refresh" 
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <label htmlFor="auto-refresh" className="text-xs text-gray-700 cursor-pointer">
                Auto-refresh (15s intervals)
              </label>
            </div>
            
            <div className="text-xs text-gray-500">
              {autoRefresh ? 'Live updates enabled' : 'Live updates disabled'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
