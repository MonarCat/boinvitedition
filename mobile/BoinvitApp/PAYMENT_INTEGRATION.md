# Boinvit Mobile App Payment Integration

This document provides an overview of how the payment system is integrated into the Boinvit mobile application.

## Architecture Overview

The mobile app uses a hybrid approach combining React Native with WebView for payment processing:

1. **React Native**: Main app UI, navigation, and business logic
2. **WebView**: Used specifically for handling secure payment processing via Paystack

## Payment Flow

The payment process follows these steps:

1. User completes booking form and taps "Proceed to Payment"
2. App creates a booking record in the backend (status: "pending")
3. App navigates to PaymentScreen with booking details
4. PaymentScreen loads a WebView with payment gateway HTML
5. Paystack payment form is loaded inside the WebView
6. User completes payment in the WebView
7. WebView communicates payment result back to React Native via postMessage
8. App verifies payment with backend API
9. Backend confirms payment with Paystack and updates booking status
10. App shows success/failure screen to user

### Detailed Payment Process

#### 1. Booking Creation
- When a user completes the booking form in the app, a new booking record is created in the database
- The booking is initially marked with status "pending" or "awaiting_payment"
- The app generates a unique booking ID that will be used throughout the payment process

#### 2. Payment Initialization
- The app navigates to the PaymentScreen component
- Key booking details (ID, amount, email, business name) are passed as route parameters
- The PaymentScreen constructs a URL for the payment gateway with these parameters
- A WebView is initialized to load this URL

#### 3. WebView Payment Processing

- The payment-gateway.html page is loaded in the WebView
- This page includes the Paystack JavaScript SDK
- When the user clicks "Pay Now", the Paystack popup is initiated
- The payment form collects and securely processes payment details
- Paystack handles all sensitive payment information

#### 4. Communication Between WebView and Native App

- Bidirectional communication is established using injected JavaScript
- WebView uses `window.ReactNativeWebView.postMessage()` to send data to React Native
- React Native receives messages via the `onMessage` event handler
- The app tracks payment status changes (pending, success, failed, etc.)

#### 5. Payment Verification

- Upon successful payment, the reference ID is sent back to the React Native app
- The app sends this reference to the backend API for verification
- The backend makes a secure call to Paystack's verification API
- If verified, the booking status is updated in the database
- The app shows a success screen with booking details

#### 6. Error Handling

- Network errors are detected and appropriate messages displayed
- Payment failures are handled gracefully
- User cancellations return to the previous screen
- Verification failures show error messages
- All errors are logged for debugging

## Key Components

### 1. PaymentScreen.tsx

Main component that:

- Loads the payment WebView
- Handles communication between WebView and React Native
- Verifies payment with the backend
- Shows relevant loading/success/error states
- Manages the state transitions during payment processing

The component passes key data via URL parameters:
```typescript
const paymentUrl = `${baseUrl}/mobile/payment-gateway.html?booking=${bookingId}&amount=${amount}&email=${encodeURIComponent(email)}&businessName=${encodeURIComponent(businessName)}&serviceName=${encodeURIComponent(serviceName)}`;
```

### 2. Payment Gateway HTML

HTML page loaded in the WebView (`/public/mobile/payment-gateway.html`):

- Self-contained payment page with Paystack integration
- Communicates with the React Native app via window.ReactNativeWebView.postMessage()
- Maintains a consistent UI style with the main app
- Handles Paystack initialization and payment processing

Key communication code:
```javascript
// Send message to React Native app
window.ReactNativeWebView.postMessage(JSON.stringify({
  status: 'success',
  reference: response.reference || reference,
  booking: bookingId
}));
```

### 3. Backend API

Payment verification endpoint (`/src/api/verify-payment.js`):

- Verifies payment with Paystack
- Updates booking status in the database
- Returns verification result to the app
- Handles errors and provides appropriate responses

The verification function:
```typescript
export async function verifyPaymentAndUpdateBooking(reference, bookingId) {
  // Verify payment with Paystack
  // Update booking status in database
  // Return result with success/failure status
}
```

## Environment Configuration

The app uses conditional logic to determine the correct URLs for:
- Payment gateway HTML (`paymentUrl`)
- Payment verification API endpoint

Development environment uses localhost URLs, while production uses the actual domain.

## Security Considerations

1. All payment processing happens through the secure Paystack gateway
2. Sensitive payment information never passes through the app
3. Payment verification is done server-side
4. All communication uses HTTPS in production

## Testing Payment Flow

To test the payment flow:

1. Run the app in development mode
2. Create a booking and proceed to payment
3. Use Paystack test cards:
   - Test Card Number: 4084 0840 8408 4081
   - CVV: Any 3 digits
   - Expiry Date: Any future date
   - PIN: 0000
   - OTP: 123456

## Extending The Payment System

To add a new payment method:

1. Create a new HTML page in `/public/mobile/` for the payment provider
2. Update the PaymentScreen.tsx to conditionally load the appropriate payment URL
3. Add corresponding verification logic in the backend

## Building for Production

When preparing for production:

1. Update the `isDevelopment` flag in PaymentScreen.tsx to `false`
2. Run `npm run build-and-copy` to generate and copy the APK
3. The APK will be available at `/public/downloads/boinvit-app.apk`

## Troubleshooting

Common payment issues:

1. **WebView not loading**: Check internet connectivity and URL construction
2. **Payment form not appearing**: Verify Paystack script is loading correctly
3. **Verification failing**: Check backend logs and network connectivity
4. **Payment success but booking not updated**: Verify backend API is working correctly
