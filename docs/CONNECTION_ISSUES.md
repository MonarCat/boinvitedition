# Connection and Browser Storage Issues

This document explains the common connection issues experienced in the application and how they are addressed.

## Issue Overview

Users may see these errors in their browser console:

1. **Datadog Browser SDK Storage Error**:
   ```
   vendor-B2w3_AxV.js:1 Datadog Browser SDK: No storage available for session. We will not send any data.
   ```

2. **Pusher WebSocket Connection Error**:
   ```
   pusher.min.js:8 WebSocket connection to 'wss://ws-eu.pusher.com/app/8e4b9b7…?protocol=7&client=js&version=4.3.1&flash=false' failed: WebSocket is closed before the connection is established.
   ```

3. **Supabase API Error**:
   ```
   prfowczgawhjapsdpncq.supabase.co/rest/v1/payment_transactions:1 Failed to load resource: the server responded with a status of 400 ()
   ```

## Root Causes

### 1. Datadog Storage Error

This occurs because:
- User is browsing in private/incognito mode where localStorage is blocked
- Browser has disabled storage access for security or privacy reasons
- Cookie/storage permissions have been denied for the domain

**Impact**: Datadog analytics will not be collected, but this does not affect application functionality.

### 2. Pusher WebSocket Connection Issues

These can happen due to:
- Temporary network connectivity problems
- Browser going offline or having connectivity issues
- Firewall or network policy blocking WebSocket connections
- Service disruption on Pusher's end

**Impact**: Real-time updates may be delayed or require manual refresh.

### 3. Supabase API 400 Error

This typically happens because:
- Request payload is malformed or missing required fields
- Row-level security policies are blocking the operation
- Rate limiting has been triggered
- The API call is attempting an invalid operation

**Impact**: Specific data updates might not be saved/processed correctly.

## Implemented Solutions

### 1. For Datadog Storage Issues

We've implemented:
- A custom storage fallback mechanism that uses in-memory storage when localStorage is unavailable
- Storage availability detection that runs on startup
- Error suppression for non-critical analytics functions

Implementation in: `src/utils/browserStorage.ts` and `src/utils/datadogConfig.ts`

### 2. For WebSocket Connection Issues

We've implemented:
- Enhanced WebSocket connection monitoring in `src/utils/webSocketManager.ts`
- Automatic reconnection with exponential backoff
- User feedback when connection issues are persistent
- Graceful degradation to ensure core app functionality works without real-time updates

### 3. For Supabase API Errors

We've improved:
- Error handling and retry logic in `src/utils/connectionHealth.ts`
- Query validation before sending requests
- Robust fallback mechanisms when API calls fail
- More informative error messages for developers

## Enhanced Realtime Architecture

To make our real-time connections more robust, we've made these architectural improvements:

1. **Enhanced Realtime Manager**:
   - Centralized connection management with the `EnhancedRealtimeManager` class
   - Better error handling and reconnection strategies
   - Diagnostic tools for debugging connection issues

2. **More Reliable Query Invalidation**:
   - Safer query invalidation with proper business ID validation
   - Retry logic for failed query invalidations
   - Consistent approach to cache invalidation across the application

## Using the New Tools

### Monitoring WebSocket Health

```tsx
import webSocketManager from '@/utils/webSocketManager';

// Get current connection status
const status = webSocketManager.getStatus();

// Subscribe to connection status changes
const unsubscribe = webSocketManager.subscribe((status) => {
  if (!status.supabase.connected) {
    // Handle disconnection
  }
});

// Clean up when component unmounts
useEffect(() => {
  return () => unsubscribe();
}, []);
```

### Safe Storage Access

```tsx
import { safeLocalStorage } from '@/utils/browserStorage';

// Will fall back to memory storage if localStorage is unavailable
safeLocalStorage.setItem('key', 'value');
const value = safeLocalStorage.getItem('key');
```

### Connection Health Check

```tsx
import { checkSupabaseConnection } from '@/utils/connectionHealth';

const checkConnection = async () => {
  const status = await checkSupabaseConnection();
  
  if (!status.supabaseConnection) {
    // Handle connection issues
    console.error('Cannot connect to Supabase:', status.error);
  }
};
```

## Best Practices

1. **Always use safeSupabaseOperation for important API calls**:
   ```tsx
   import { safeSupabaseOperation } from '@/utils/connectionHealth';
   
   await safeSupabaseOperation(async () => {
     return await supabase.from('table').select('*');
   });
   ```

2. **Handle offline scenarios gracefully**:
   - Cache important data locally when online
   - Show appropriate UI feedback when offline
   - Attempt to reconnect automatically when back online

3. **Implement manual refresh options**:
   - Always provide a way for users to manually refresh data
   - Show the last successful data update time
   - Clearly indicate when operating in offline mode

## Troubleshooting for Developers

If you continue to see connection issues:

1. Check browser console for specific error messages
2. Verify network connectivity and firewall settings
3. Test in a standard browsing mode (non-private)
4. Clear browser cache and cookies if issues persist
5. Verify Supabase and Pusher service status

## Monitoring

We now collect more diagnostic information to help troubleshoot connection issues:

1. Connection status and error details
2. Reconnection attempts and success rates
3. Storage availability across different browsers

This data helps us continuously improve connection reliability.
