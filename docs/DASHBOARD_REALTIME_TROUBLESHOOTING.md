# Dashboard Real-time Updates Troubleshooting

This document explains how the real-time update system works for the dashboard statistics, especially with respect to new bookings and clients created through the public booking page.

## The Problem

New bookings created through the public booking page may not be immediately reflected in the dashboard's real-time stats, even though clients are correctly created in the database.

## Root Causes

1. **Incomplete Query Invalidation**: When bookings are created through the public booking page, the React Query cache for dashboard stats wasn't properly invalidated with the correct business ID.

2. **Disconnected Realtime Channels**: The real-time subscription system on the dashboard was not receiving events from bookings made on the public page because they were using separate Supabase channels.

3. **Missing Business ID in Query Keys**: Some query invalidations were using general query keys without the specific business ID, making them ineffective.

## The Solution

We've implemented several changes to fix this issue:

1. **Enhanced `useClientPayments` Hook**: Now invalidates dashboard stats with the correct business ID when used for bookings.

2. **Expanded `useClientPaymentMonitor` Hook**: Added monitoring for the bookings table to ensure dashboard stats are updated when bookings change.

3. **Improved `useBookingCreation` Hook**: Now properly invalidates all relevant queries with the specific business ID when a booking is created.

4. **Added `useDashboardRefresh` Hook**: Provides a manual refresh function for dashboard stats that can be used as a fallback.

5. **Direct Database Triggers**: Added code that makes small database queries to ensure fresh data is loaded after bookings are created.

## How It Works Now

1. When a client creates a booking through the public booking page:
   - The client is created or found in the database
   - The booking is created and associated with the client
   - The `useBookingCreation` hook invalidates all relevant queries with the correct business ID
   - A direct database query is made to ensure fresh data

2. On the dashboard:
   - The `useSimpleRealtime` hook is listening for changes to the bookings table
   - When a booking is created, it triggers an update of the dashboard stats
   - The dashboard stats are recalculated with the new booking data

## Manual Refresh Option

If the dashboard stats still don't update automatically, you can use the new `useDashboardRefresh` hook to add a manual refresh button to the dashboard.

```tsx
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

const Dashboard = () => {
  const { business } = useQuery(...);
  const { refreshDashboard } = useDashboardRefresh(business?.id);
  
  return (
    <Button onClick={refreshDashboard}>
      Refresh Dashboard
    </Button>
  );
};
```

## Verifying It's Working

To verify that the real-time updates are working correctly:

1. Open the dashboard page in one browser window
2. Create a booking through the public booking page in another browser window
3. Check that the dashboard stats update automatically without refreshing the page
4. If the stats don't update automatically, use the manual refresh button

## Troubleshooting

If dashboard stats still don't update in real-time:

1. Check browser console for any errors in the real-time channels
2. Verify that the Supabase Realtime feature is enabled for all required tables
3. Confirm that the business ID is correctly passed to all hooks
4. Try using the manual refresh function as a fallback
