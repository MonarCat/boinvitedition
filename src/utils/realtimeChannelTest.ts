/**
 * Utility for testing and verifying real-time channel subscriptions
 * This helps troubleshoot real-time update issues by logging channel states
 */

import { supabase } from '@/integrations/supabase/client';
import { enhancedRealtimeManager } from '@/services/EnhancedRealtimeManager';

export interface ChannelTest {
  name: string;
  table: string;
  filter?: string;
  isSubscribed?: boolean;
  error?: string;
}

/**
 * Tests all required payment-related real-time channels for a business
 * @param businessId The business ID to test channels for
 */
export const testPaymentChannels = async (businessId: string): Promise<ChannelTest[]> => {
  console.log('🔄 Testing payment-related real-time channels for business:', businessId);
  
  const results: ChannelTest[] = [];
  
  // Define all channels that should be present for payments
  const requiredChannels = [
    { name: 'payment_transactions', table: 'payment_transactions', filter: `business_id=eq.${businessId}` },
    { name: 'payments', table: 'payments', filter: `business_id=eq.${businessId}` },
    { name: 'client_business_transactions', table: 'client_business_transactions', filter: `business_id=eq.${businessId}` },
    { name: 'bookings', table: 'bookings', filter: `business_id=eq.${businessId}` }
  ];
  
  // Get active channels from EnhancedRealtimeManager
  const activeSubscriptions = enhancedRealtimeManager.getActiveSubscriptions();
  
  // Check each required channel
  for (const channel of requiredChannels) {
    try {
      // Check if this channel exists in active subscriptions
      const isActive = activeSubscriptions.some(sub => 
        sub.channel.includes(channel.table) && 
        (channel.filter ? sub.filter === channel.filter : true)
      );
      
      results.push({
        ...channel,
        isSubscribed: isActive,
        error: isActive ? undefined : 'Channel not subscribed'
      });
    } catch (error) {
      console.error(`Error checking channel ${channel.name}:`, error);
      results.push({
        ...channel,
        isSubscribed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Log the results
  console.log('📊 Real-time channel test results:', results);
  console.log(`✅ ${results.filter(r => r.isSubscribed).length} of ${results.length} required channels are active`);
  
  if (results.some(r => !r.isSubscribed)) {
    console.warn('⚠️ Some required real-time channels are not active!');
  }
  
  return results;
};

/**
 * Tests if the Supabase real-time connection is working properly
 */
export const testRealtimeConnection = async (): Promise<boolean> => {
  return new Promise(resolve => {
    try {
      const channel = supabase.channel('connection-test');
      
      channel
        .on('system', { event: 'connected' }, () => {
          console.log('✅ Real-time connection test successful');
          channel.unsubscribe();
          resolve(true);
        })
        .on('system', { event: 'disconnected' }, () => {
          console.error('❌ Real-time connection test failed: disconnected');
          resolve(false);
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.error('❌ Real-time connection test failed:', status);
            setTimeout(() => resolve(false), 3000);
          }
        });
        
      // Timeout for connection test
      setTimeout(() => {
        console.error('❌ Real-time connection test timed out');
        channel.unsubscribe();
        resolve(false);
      }, 5000);
    } catch (error) {
      console.error('❌ Real-time connection test error:', error);
      resolve(false);
    }
  });
};

/**
 * Run a comprehensive test of all payment-related real-time functionality
 */
export const runComprehensiveRealtimeTest = async (businessId: string) => {
  console.group('🔍 Comprehensive Real-time Test');
  console.log('Testing real-time connection and channels...');
  
  // First test the basic connection
  const connectionWorking = await testRealtimeConnection();
  
  if (!connectionWorking) {
    console.error('❌ Real-time connection is not working - channel tests may fail');
  }
  
  // Then test all required channels
  const channelTests = await testPaymentChannels(businessId);
  
  // Summarize results
  const summary = {
    connectionWorking,
    totalChannelsRequired: channelTests.length,
    activeChannels: channelTests.filter(c => c.isSubscribed).length,
    missingChannels: channelTests.filter(c => !c.isSubscribed).map(c => c.name)
  };
  
  console.log('📊 Real-time test summary:', summary);
  console.groupEnd();
  
  return {
    connectionWorking,
    channelTests,
    summary
  };
};
