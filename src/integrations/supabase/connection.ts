import { supabase } from '@/integrations/supabase/client';
import { enhancedRealtimeManager } from '@/services/EnhancedRealtimeManager';
import { checkSupabaseConnection } from '@/utils/connectionHealth';
import { initStorageDiagnostics } from '@/utils/browserStorage';
import { setupSupabaseWebSocketMonitoring } from '@/utils/webSocketManager';
import { configureDatadogSafely } from '@/utils/datadogConfig';
import { QueryClient } from '@tanstack/react-query';

/**
 * Initialize the Supabase connection and set up monitoring and diagnostics
 * @param queryClient The React Query client to use for invalidations
 */
export const initializeSupabaseConnection = (queryClient: QueryClient): void => {
  // Run storage diagnostics
  initStorageDiagnostics();
  
  // Configure Datadog to work in restricted environments
  configureDatadogSafely();
  
  // Set up Supabase WebSocket monitoring
  setupSupabaseWebSocketMonitoring();
  
  // Register query client with enhanced realtime manager
  enhancedRealtimeManager.registerQueryClient(queryClient);
  
  // Check initial connection
  checkSupabaseConnection()
    .then(status => {
      console.log('Supabase connection status:', status);
      if (!status.supabaseConnection) {
        console.error('❌ Failed to connect to Supabase:', status.error);
      }
    })
    .catch(err => {
      console.error('Error checking Supabase connection:', err);
    });
};

/**
 * Healthcheck function to test Supabase connectivity
 * This can be exposed as an API endpoint for monitoring tools
 */
export const checkSupabaseHealth = async (): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> => {
  const startTime = Date.now();
  try {
    // Try a simple query to check connection
    const { data, error } = await supabase
      .from('healthcheck')
      .select('*')
      .maybeSingle();
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Check for expected error (table doesn't exist)
    if (error && error.code === '42P01') {
      return {
        healthy: true,
        latency,
      };
    } else if (error) {
      return {
        healthy: false,
        latency,
        error: `${error.code}: ${error.message}`
      };
    }
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      healthy: false,
      latency: endTime - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
