# Boinvit Mobile App Payment Flow Testing Guide

This document provides detailed instructions for testing the payment flow in the Boinvit mobile app.

## Prerequisites

- Android device or emulator with Google Play Services
- Development environment set up as outlined in NEXT_STEPS.md
- Boinvit mobile app installed on the device

## Paystack Test Cards

Use the following test cards for Paystack payment testing:

| Card Type | Number | CVV | Expiry Date | PIN | OTP |
|-----------|--------|-----|-------------|-----|-----|
| Visa | 4084 0840 8408 4081 | Any 3 digits | Any future date | 0000 | 123456 |
| Mastercard | 5060 6666 6666 6666 077 | Any 3 digits | Any future date | 0000 | 123456 |

## Testing Process

### 1. Local Environment Testing

#### 1.1. Start the Development Server

```bash
# In the main project directory
cd /home/developer/Web Apps/boinvitedition
npm run dev

# Confirm server is running by checking:
curl http://localhost:5173/mobile/payment-gateway.html
```

#### 1.2. Configure the App for Local Testing

Update the PaymentScreen.tsx isDevelopment flag:

```typescript
// Set to true for local testing
const isDevelopment = true;
```

#### 1.3. Run the App

```bash
cd /home/developer/Web Apps/boinvitedition/mobile/BoinvitApp
npm run android
```

### 2. Payment Flow Testing Steps

Follow these steps to test the complete payment flow:

1. **Create a Booking**:
   - Launch the app and navigate to the Home screen
   - Select a service category
   - Fill out the booking form with test data
   - Submit the booking form

2. **Initiate Payment**:
   - On the booking confirmation screen, tap "Pay Now"
   - The app should navigate to the PaymentScreen
   - The WebView should load with the payment gateway

3. **Complete Payment**:
   - Enter test card details (see table above)
   - Complete the payment form
   - Enter the test PIN (0000) when prompted
   - Enter the test OTP (123456) when prompted

4. **Verify Payment Status**:
   - Watch for the "Verifying payment..." status
   - The app should communicate with the backend to verify the payment
   - Upon successful verification, you should see "Payment Successful!"
   - The app should navigate to PaymentSuccessScreen

5. **Check Booking Status Update**:
   - Verify that the booking status is updated to "paid" in the database
   - You can check this via the admin panel or database query

### 3. Error Handling Testing

Test the following error scenarios:

#### 3.1. Network Error During Payment

1. Enable airplane mode after initiating payment but before completing it
2. Verify appropriate error message is displayed
3. Verify the app handles the error gracefully

#### 3.2. Payment Cancellation

1. Start the payment process
2. Close the payment form or press back
3. Verify the app returns to the previous screen correctly
4. Verify no payment is recorded

#### 3.3. Invalid Card Details

1. Enter invalid card details (e.g., expired date)
2. Verify Paystack shows appropriate error
3. Verify app handles the error appropriately

#### 3.4. Backend Verification Failure

To test this scenario, temporarily modify the verification function:

```typescript
// In PaymentVerification.ts, modify the verifyPaymentAndUpdateBooking function
export async function verifyPaymentAndUpdateBooking(reference, bookingId) {
  // Simulate verification failure
  return { 
    success: false, 
    error: 'Test verification failure'
  };
}
```

Then verify that:
1. The app shows an appropriate error message
2. The user is redirected correctly
3. No booking status update occurs

### 4. Production Testing

Before releasing the app to production:

1. Set the `isDevelopment` flag to `false` in PaymentScreen.tsx
2. Update all URLs to point to production
3. Build the APK using the build script
4. Install the APK on a test device
5. Complete a full payment flow using test cards
6. Verify all systems work correctly with production endpoints

## Common Issues and Troubleshooting

### WebView Not Loading

- Check internet connectivity
- Verify the payment gateway URL is correct
- Ensure WebView permissions are granted

### Payment Verification Failures

- Check API endpoint URLs
- Verify the payment reference is correctly passed between components
- Inspect server logs for errors

### UI Rendering Issues

- Test on multiple screen sizes
- Check for layout inconsistencies
- Ensure proper loading states are shown

## Reporting Issues

When reporting payment-related issues, include the following information:

1. Payment reference
2. Booking ID
3. Error messages (if any)
4. Steps to reproduce
5. Device model and OS version
6. Screenshots (if applicable)
