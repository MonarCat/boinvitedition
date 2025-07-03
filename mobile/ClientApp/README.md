# Boinvit for Booking

## Client Application for Boinvit Booking System

Boinvit for Booking is a dedicated client application for users to manage their service bookings across multiple businesses registered on the Boinvit platform.

## Features

- **Booking Management**: View upcoming, past, and all bookings
- **Booking Details**: See detailed information about each booking
- **Rescheduling**: Reschedule bookings (once per booking, at least 2 hours before appointment)
- **QR Code Scanner**: Scan business QR codes to quickly access booking pages
- **Payment Integration**: Complete payments for bookings through the app
- **Profile Management**: Save personal details for faster booking

## Getting Started

### Prerequisites

- Node.js 16 or higher
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/boinvit-client.git
   cd boinvit-client
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

4. Start the development server
   ```bash
   npm start
   ```

5. Run on Android
   ```bash
   npm run android
   ```

   Or on iOS
   ```bash
   npm run ios
   ```

## Building for Production

### Android

```bash
# Generate a signed APK
npm run build:android

# Generate an App Bundle for Play Store
npm run build:android-bundle
```

### iOS

```bash
# Follow the React Native documentation for iOS production builds
# https://reactnative.dev/docs/publishing-to-app-store
```

## Development Guidelines

- Follow the established folder structure
- Use TypeScript for all new components
- Run linting before committing changes: `npm run lint`
- Test your changes on both Android and iOS devices

## Folder Structure

```
/src
  /components    - Reusable UI components
  /screens       - Screen components
  /hooks         - Custom React hooks
  /lib           - Libraries and utilities
  /navigation    - Navigation configuration
  /services      - API services
  /types         - TypeScript type definitions
  /utils         - Utility functions
  /assets        - Images, fonts, etc.
```

## Integration with Business App

Boinvit for Booking is designed to work alongside the Boinvit for Business application. The two applications share backend resources but provide tailored experiences for their respective user groups.

## License

This project is proprietary software owned by Boinvit.
