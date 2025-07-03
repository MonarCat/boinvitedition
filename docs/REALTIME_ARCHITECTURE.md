# Real-time System Architecture

This document outlines the architecture and implementation of the real-time update system used in the Boinvite application.

## Overview

The real-time system enables instant updates across the application when data changes, ensuring that users always see the most current information without needing to refresh the page. This is particularly important for business dashboards that need to track bookings, payments, clients, and other critical data in real-time.

## Technical Implementation

### 1. Database Configuration

The system relies on Supabase's real-time functionality, which uses PostgreSQL's logical replication feature. Tables that need real-time capabilities are added to a `supabase_realtime` publication with `REPLICA IDENTITY FULL` to ensure change events contain complete data.

```sql
ALTER TABLE public.payment_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;
```

### 2. Connection Management

The `RealtimeConnectionManager` service (/src/services/RealtimeConnectionManager.ts) implements a singleton pattern to centralize all WebSocket connections. This reduces resource usage by pooling connections and provides advanced connection management features:

- Connection pooling to reduce WebSocket connections
- Exponential backoff for reconnection attempts
- Network status change detection
- Memory leak prevention
- Connection status monitoring

### 3. React Integration

The `useRealtime` hook (/src/hooks/useRealtime.tsx) provides a React interface to the connection manager, with features including:

- Subscription management based on component lifecycle
- Connection status tracking
- Toast notifications for real-time events
- Automatic query invalidation to refresh UI components

### 4. UI Components

The `RealtimeConnectionStatus` component provides visual feedback on the real-time connection status:

- Green indicator for fully connected
- Yellow for partially connected
- Red for disconnected
- Connection details in tooltip
- Manual reconnect button

## Using Real-time Features

### Setting Up Real-time in a New Component

```tsx
import { useRealtime } from '@/hooks/useRealtime';

function MyComponent({ businessId }) {
  const { connectionStatus, connectionError } = useRealtime({
    businessId,
    // Only enable what you need
    enableBookings: true,
    enablePayments: false,
    enableClients: false,
    // ...etc
  });
  
  // Use connection status if needed
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

### Manual Connection Management

In some cases, you may need to manually manage connections:

```tsx
import { realtimeManager } from '@/services/RealtimeConnectionManager';

// Force reconnect all channels
realtimeManager.reconnectAll();

// Subscribe to a specific table
const subscriptionId = realtimeManager.subscribe(
  {
    table: 'my_table',
    filter: `business_id=eq.${businessId}`
  },
  (payload) => {
    // Handle change event
    console.log('Change detected:', payload);
  }
);

// Unsubscribe when done
realtimeManager.unsubscribeAll(subscriptionId);
```

## Performance Considerations

- Only subscribe to tables you need in each component
- Use the `filter` parameter to limit events to relevant rows
- Properly clean up subscriptions in component unmount
- Use debounced callbacks for operations triggered by real-time events
- Consider implementing a fallback mechanism for poor connections

## Testing

The real-time system can be tested using the command:

```
npm run test:realtime
```

For manual testing, open multiple browser windows with the same business dashboard and make changes in one to see them reflected in the others.

## Troubleshooting

Common issues:

1. **No real-time updates**: Ensure the table is added to the Supabase real-time publication and has REPLICA IDENTITY FULL set.

2. **Memory leaks**: Check that components properly clean up subscriptions when unmounting.

3. **High resource usage**: Limit the number of subscriptions by only enabling what's needed.

4. **Duplicate updates**: Make sure query invalidation is correctly scoped to prevent redundant refetches.
