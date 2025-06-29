# Quick Start Guide for Boinvit Mobile App

This guide provides the essential steps to get the Boinvit mobile app running on your Android device.

## Prerequisites

You already have:
- Android Studio installed
- Basic understanding of React Native development
- A physical Android device or emulator ready

## Step 1: Start the Main Web Server

```bash
# Open a terminal and navigate to the main project directory
cd /home/developer/Web\ Apps/boinvitedition

# Start the development server
npm run dev
```

Verify the server is running by visiting http://localhost:5173 in your browser.

## Step 2: Set Up the Mobile App Development Environment

```bash
# Open a new terminal and navigate to the app directory
cd /home/developer/Web\ Apps/boinvitedition/mobile/BoinvitApp

# Run the setup script to prepare the environment
chmod +x setup.sh
./setup.sh
```

## Step 3: Start the React Native Development Server

```bash
# In the app directory
npm start
```

Keep this terminal running throughout development.

## Step 4: Connect Your Android Device

1. Enable USB debugging on your device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable developer options
   - Go to Settings > System > Developer options
   - Enable USB debugging

2. Connect your device to your computer with a USB cable.

3. Verify connection with:
   ```bash
   adb devices
   ```

   You should see your device listed.

## Step 5: Run the App on Your Device

```bash
# Open a new terminal and navigate to the app directory
cd /home/developer/Web\ Apps/boinvitedition/mobile/BoinvitApp

# Build and run the app
npm run android
```

The app should now install and launch on your device.

## Step 6: Test Core Functionality

Test the following features:

1. **Splash Screen**: Check the app loading screen
2. **Home Screen**: Navigate through categories
3. **Booking**: Create a test booking
4. **Payment Flow**: Complete a test payment using the test cards
   - Card: 4084 0840 8408 4081
   - Expiry: Any future date
   - CVV: 123
   - PIN: 0000
   - OTP: 123456

## Common Issues and Solutions

### Build Failures

```bash
# Clean the Android build
cd android && ./gradlew clean && cd ..

# Try building again
npm run android
```

### WebView Not Loading

Check that:
1. The development server is running
2. The URLs in PaymentScreen.tsx match your environment
3. The device has internet connectivity

### Metro Bundler Issues

```bash
# Reset Metro cache
npm start -- --reset-cache
```

## Next Steps

After successfully running and testing the app:

1. Make any necessary UI/UX adjustments
2. Prepare for production build using build.sh
3. Test the production APK
4. Deploy the final version

For more detailed information, refer to NEXT_STEPS.md and PAYMENT_TESTING.md.
