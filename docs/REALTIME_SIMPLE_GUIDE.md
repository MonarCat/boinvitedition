# Boinvite Realtime Functionality

This document explains how to use the simplified real-time functionality in the application.

## Overview

The application now uses a simplified direct Supabase real-time implementation that makes it easier to maintain and debug. This approach reduces complexity while ensuring reliable real-time updates.

## How to Use the Real-time Hook

### Basic Usage

```tsx
import { useSimpleRealtime } from '@/hooks/useSimpleRealtime';

function MyComponent() {
  const { isConnected, error, forceReconnect } = useSimpleRealtime({
    businessId: 'your-business-id',
    showToasts: true
  });

  return (
    <div>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {error && <p>Error: {error}</p>}
      <button onClick={forceReconnect}>Reconnect</button>
    </div>
  );
}
```

### Configuration Options

The `useSimpleRealtime` hook accepts the following options:

```typescript
interface UseSimpleRealtimeOptions {
  businessId: string;
  tables?: {
    bookings?: boolean;
    payments?: boolean;
    clients?: boolean;
    staff?: boolean;
  };
  showToasts?: boolean;
}
```

- `businessId`: (Required) The ID of the business to subscribe to updates for
- `tables`: (Optional) Configure which tables to subscribe to
- `showToasts`: (Optional) Whether to show toast notifications on updates

### Return Values

The hook returns:

```typescript
{
  status: {
    connected: boolean;
    error: string | null;
  },
  forceReconnect: () => void;
  isConnected: boolean;
  error: string | null;
}
```

## Components

### RealtimeDashboard

A simple component that shows the real-time connection status and allows reconnecting.

```tsx
<RealtimeDashboard businessId="your-business-id" />
```

### RealtimeMonitor

A more advanced component that shows real-time updates for bookings, payments, and clients.

```tsx
<RealtimeMonitor businessId="your-business-id" />
```

## How It Works

1. The `useSimpleRealtime` hook sets up direct Supabase channel subscriptions
2. When a database change occurs, Supabase sends the change to the client
3. The hook invalidates the relevant React Query cache
4. Components re-render with the fresh data

This approach is more reliable than the previous implementation because:

1. It has fewer abstraction layers
2. It uses the official Supabase client directly
3. It has simpler reconnection logic
4. Each table has its own dedicated channel

## Troubleshooting

If you're not receiving real-time updates:

1. Make sure real-time is enabled for your table in the Supabase dashboard
2. Check the connection status using the `isConnected` value
3. Look for any errors in the `error` value
4. Try forcing a reconnect with `forceReconnect()`
5. Check browser console for any error messages
6. Verify your Supabase URL and API key in the .env file
