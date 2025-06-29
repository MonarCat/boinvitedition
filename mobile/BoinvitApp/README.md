# Boinvit Mobile App

A React Native mobile application for the Boinvit booking platform.

## Overview

This app provides a mobile interface for Boinvit users to:
- Browse businesses and services
- Make bookings
- Complete payments securely
- View booking history and details

## Technology Stack

- React Native 0.72.4
- React Navigation for app navigation
- WebView for payment processing
- Axios for API communication

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Android Studio + SDK for Android development
- Xcode for iOS development (macOS only)

### Installation

1. First, run the setup script to install dependencies:

```bash
./setup.sh
```

2. To start the development server:

```bash
npm start
```

3. To run on Android:

```bash
npm run android
```

4. To run on iOS (macOS only):

```bash
npm run ios
```

## Project Structure

```
mobile/BoinvitApp/
├── android/              # Android project files
├── ios/                  # iOS project files (if applicable)
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   │   ├── SplashScreen.tsx      # App loading screen
│   │   ├── HomeScreen.tsx        # Main dashboard
│   │   ├── BookingScreen.tsx     # Booking form
│   │   ├── AuthScreen.tsx        # Login/Register
│   │   ├── ProfileScreen.tsx     # User profile
│   │   ├── WebViewScreen.tsx     # Generic WebView
│   │   ├── PaymentScreen.tsx     # Payment processing
│   │   └── PaymentSuccessScreen.tsx  # Confirmation
│   └── utils/            # Helper functions
├── App.tsx               # Main component with navigation
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Building for Production

To build the APK for distribution:

```bash
./build.sh
```

This will:
1. Set production environment variables
2. Build the APK
3. Copy it to the public downloads directory
4. Generate a version info file
5. Reset development environment variables

The APK will be available at `/public/downloads/boinvit-app.apk`

## Integration Documentation

- [Payment Integration](./PAYMENT_INTEGRATION.md) - Details on the payment flow

## License

All rights reserved. This code is proprietary and confidential.

## Contact

For any questions or support, contact the Boinvit development team.
