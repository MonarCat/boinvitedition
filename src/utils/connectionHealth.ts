import { supabase } from '@/integrations/supabase/client';

/**
 * Utility for monitoring and debugging connection issues with Supabase
 */

interface ConnectionStatus {
  online: boolean;
  supabaseConnection: boolean;
  lastChecked: Date;
  error: string | null;
}

let status: ConnectionStatus = {
  online: navigator.onLine,
  supabaseConnection: true,
  lastChecked: new Date(),
  error: null
};

// Listen for online/offline events
window.addEventListener('online', () => {
  status.online = true;
  console.log('🌐 Browser is online');
});

window.addEventListener('offline', () => {
  status.online = false;
  console.log('🔌 Browser is offline');
});

/**
 * Check the connection to Supabase
 * This can be used to verify if Supabase is available
 */
export const checkSupabaseConnection = async (): Promise<ConnectionStatus> => {
  try {
    // Try a simple query to check connection
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('healthcheck')
      .select('*')
      .maybeSingle();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // If no table exists, this will likely return an error, but the connection is fine
    // We're checking if we get any response at all
    if (error && error.code === '42P01') {
      // Table doesn't exist error - connection is fine
      status = {
        online: navigator.onLine,
        supabaseConnection: true,
        lastChecked: new Date(),
        error: null
      };
      console.log(`✅ Supabase connection check: OK (${responseTime}ms)`);
    } else if (error) {
      // Other errors - may indicate connection issues
      console.warn('⚠️ Supabase connection check error:', error);
      status = {
        online: navigator.onLine,
        supabaseConnection: false,
        lastChecked: new Date(),
        error: `${error.code}: ${error.message}`
      };
    } else {
      // No error - connection is fine
      status = {
        online: navigator.onLine,
        supabaseConnection: true,
        lastChecked: new Date(),
        error: null
      };
      console.log(`✅ Supabase connection check: OK (${responseTime}ms)`);
    }
  } catch (err) {
    console.error('❌ Failed to check Supabase connection:', err);
    status = {
      online: navigator.onLine,
      supabaseConnection: false,
      lastChecked: new Date(),
      error: err instanceof Error ? err.message : String(err)
    };
  }
  
  return status;
};

/**
 * Get the current connection status
 */
export const getConnectionStatus = (): ConnectionStatus => {
  return {
    ...status,
    online: navigator.onLine // Always get the latest online status
  };
};

/**
 * Safely execute a Supabase operation with retry logic
 */
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> => {
  const { 
    maxRetries = 3, 
    retryDelay = 1000,
    onRetry = (attempt, error) => console.warn(`Retrying operation (${attempt}/${maxRetries})`, error)
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry if we have attempts left
      if (attempt < maxRetries) {
        onRetry(attempt, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  throw lastError;
};
