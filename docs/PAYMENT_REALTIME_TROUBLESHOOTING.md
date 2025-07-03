# Payment System Real-time Troubleshooting

This document provides information on how to troubleshoot real-time payment updates in the Boinvit system.

## Overview of the Real-time System

The payment system relies on real-time updates from Supabase for:

1. **Payment Status Updates**: When a payment is completed or fails
2. **Booking Status Updates**: When a booking payment status changes
3. **Transaction Updates**: When client-business transactions are recorded

## Implemented Solutions

### 1. Payment UI Timing Issues

The system now includes:

- **Delayed Payment Initialization**: Added a 1.5-second delay before opening payment UI
- **Improved Loading Indicators**: Better visual feedback during payment processing
- **Manual Refresh Option**: Added buttons to manually check payment status

### 2. Real-time Updates for Payments

Enhanced the real-time subscriptions:

- **Multiple Table Monitoring**: Now monitoring `payments`, `payment_transactions`, `client_business_transactions`, and `bookings` tables
- **Query Invalidation**: More comprehensive query invalidation to ensure fresh data
- **Fallback Polling**: Automatic polling when real-time connection issues are detected
- **Connection Health Monitoring**: Real-time diagnostics to detect and report connection issues

### 3. Diagnostic Tools

Added tools to help diagnose real-time issues:

- **Channel Testing**: The `runComprehensiveRealtimeTest` function verifies all required channels
- **Connection Status Reporting**: Real-time connection status tracking and reporting
- **Enhanced Error Handling**: More informative error messages and logging

## Checking Real-time Channel Status

You can check if the real-time channels are working by running:

```typescript
import { runComprehensiveRealtimeTest } from '@/utils/realtimeChannelTest';

// Replace with actual business ID
const businessId = 'your-business-id';

// Run the test
const results = await runComprehensiveRealtimeTest(businessId);
console.log('Channel test results:', results);
```

## Handling Common Issues

### Missing Updates

If payment updates aren't showing up:

1. Check the browser console for connection errors
2. Verify that all four key tables are being monitored
3. Try the manual refresh option
4. Check Supabase logs for real-time errors

### PIN Prompt Timing Issues

If the PIN prompt appears too early:

1. The 1.5-second delay should resolve most timing issues
2. If problems persist, increase the delay in the payment gateway HTML and MpesaPayment component

### Mobile App Payment Verification

If the mobile app isn't showing payment confirmation:

1. Ensure the verify-payment API endpoint is working correctly
2. Check that the mobile app is passing the correct payment reference
3. Verify that the payment is being properly recorded in at least one of the three tables

## Testing Payment Flow

When testing the payment flow:

1. Check browser console to verify real-time subscriptions are active
2. Monitor network requests to see if the payment is being processed
3. Use the PaymentRefreshButton to manually check status if needed
4. Check Supabase database directly to verify payment records
