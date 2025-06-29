# Boinvit Mobile App Build & Deployment Checklist

This checklist provides a step-by-step guide for building, testing, and deploying the Boinvit mobile app.

## Development Environment Setup

- [ ] Install Node.js (version 16+)
- [ ] Install npm/yarn package manager
- [ ] Install Android Studio and SDK tools
- [ ] Configure ANDROID_HOME environment variable
- [ ] Set up Android emulator or connect physical device
- [ ] Run the setup script: `./setup.sh`

## Pre-Build Configuration

- [ ] Update app version in package.json
- [ ] Check all API endpoints are correct for target environment
- [ ] Update the isDevelopment flag in PaymentScreen.tsx:
  - `true` for testing
  - `false` for production
- [ ] Verify Paystack public key is correct
- [ ] Make sure all dependencies are installed: `npm install`

## Building the App

### Development Build

- [ ] Start the development server: `npm run dev` (in main project directory)
- [ ] Start the React Native development server: `npm start`
- [ ] Build and run on connected device: `npm run android`

### Production Build

- [ ] Make sure the production environment variables are set correctly
- [ ] Run the build script: `./build.sh`
- [ ] Verify the APK is generated in `android/app/build/outputs/apk/release/`
- [ ] Verify the APK is copied to public download directory

## Testing Checklist

### Functional Testing

- [ ] Splash screen loads and transitions correctly
- [ ] Home screen displays all categories
- [ ] Navigation works between all screens
- [ ] WebView loads external content correctly
- [ ] Forms submit data correctly
- [ ] Booking process creates records in the database

### Payment Flow Testing

- [ ] Payment screen loads correctly
- [ ] WebView renders payment gateway correctly
- [ ] Paystack form appears and accepts input
- [ ] Test payment completes successfully
- [ ] Payment verification works correctly
- [ ] Success screen shows with correct booking details
- [ ] Error states are handled appropriately

### Edge Cases

- [ ] App handles network disconnection gracefully
- [ ] App recovers from background/foreground transitions
- [ ] Long text fields display correctly
- [ ] App works on various screen sizes
- [ ] Error messages are clear and actionable

## Deployment Process

### App File Distribution

- [ ] Build production APK: `./build.sh`
- [ ] Verify APK is copied to `/public/downloads/boinvit-app.apk`
- [ ] Update version info file in `/public/downloads/app-version.json`
- [ ] Test downloading APK from the website download page
- [ ] Verify the downloaded APK installs correctly

### Web Integration

- [ ] Update mobile download page with correct version information
- [ ] Ensure download links point to correct APK file
- [ ] Test the download page on various devices and browsers
- [ ] Add announcements about the new app version on the website

### Google Play Store (Future)

- [ ] Create developer account on Google Play Console
- [ ] Prepare store listing (screenshots, descriptions, etc.)
- [ ] Build signed app bundle: `npm run build:android-bundle`
- [ ] Upload to Google Play Console
- [ ] Complete store listing and release information
- [ ] Submit for review

## Post-Deployment

- [ ] Monitor crash reports and errors
- [ ] Collect user feedback
- [ ] Track performance metrics
- [ ] Plan next version updates based on feedback
- [ ] Document any issues for future reference

## Release Notes Template

```
# Boinvit Mobile App v0.1.0

Release Date: [Date]

## New Features
- Initial release with booking functionality
- Integrated payment system via Paystack
- User authentication and profile management

## Bug Fixes
- N/A (Initial Release)

## Known Issues
- [List any known issues]

## Installation Instructions
1. Download the APK from the website
2. Open the APK file on your Android device
3. Follow installation prompts
4. Open the app and sign in or create an account
```

## Emergency Rollback Plan

In case of critical issues after deployment:

1. Remove the APK from the download directory
2. Add a message on the download page about maintenance
3. Fix the issues in the code
4. Rebuild and test thoroughly
5. Re-deploy when fixed
