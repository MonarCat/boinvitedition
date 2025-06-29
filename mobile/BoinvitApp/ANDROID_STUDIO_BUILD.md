# Building Boinvit Mobile App with Android Studio

This guide covers building the Boinvit mobile app using Android Studio and also provides instructions for Docker-based builds.

## 1. Prerequisites

Before proceeding, ensure you have:

1. JDK 11 or newer installed
2. Android Studio with Android SDK installed
3. React Native development environment set up

## 2. Fixing Gradle Configuration

We had to make the following changes to fix build issues:

1. Updated Gradle wrapper to use version 8.0.1 instead of 8.14.1
2. Updated Kotlin version from 2.1.20 to 1.7.22 to match the React Native Gradle plugin
3. Standardized Android SDK versions to compileSdkVersion 33 (from 35)

## 2. Opening the Project in Android Studio

1. Launch Android Studio
2. Select "Open an existing Android Studio project"
3. Navigate to `/home/developer/Web Apps/boinvitedition/mobile/BoinvitApp/android`
4. Click "OK" to open the project

## 3. Configure Project in Android Studio

1. Let Android Studio sync Gradle files
2. Install any missing SDK components if prompted
3. Set up JAVA_HOME in Android Studio:
   - Go to File > Settings (or Android Studio > Preferences on macOS)
   - Navigate to Build, Execution, Deployment > Build Tools > Gradle
   - Make sure Gradle JDK is set (use Android Studio's embedded JDK if available)

## 4. Start the Metro Bundler

Before running the app, start the Metro bundler in a separate terminal:

```bash
cd "/home/developer/Web Apps/boinvitedition/mobile/BoinvitApp"
npm start
```

## 5. Set Up an Emulator

1. In Android Studio, click the "AVD Manager" icon in the toolbar
2. Click "Create Virtual Device"
3. Select a phone (e.g., Pixel 4)
4. Select a system image (Android 11+ recommended)
5. Complete the setup with default options
6. Start the emulator by clicking the play button

## 6. Run the App

1. In Android Studio, select the created emulator from the dropdown menu
2. Click the green "Run" button (or press Shift+F10)
3. Android Studio will build and deploy the app to the emulator

## 7. Testing the App

Once the app is running, test all functionalities as outlined in the NEXT_STEPS.md document:
- Test the splash screen
- Navigate through all screens
- Test the booking flow
- Test the payment process using test card details

## 8. Building a Release APK

To build a signed release APK:

1. Create a keystore file if it doesn't exist:

```bash
cd "/home/developer/Web Apps/boinvitedition/mobile/BoinvitApp/android/app"
keytool -genkey -v -keystore boinvit-key.keystore -alias boinvit -keyalg RSA -keysize 2048 -validity 10000 -storepass boinvit123 -keypass boinvit123 -dname "CN=Boinvit, OU=Mobile, O=Boinvit Ltd, L=Nairobi, S=Nairobi, C=KE"
```

2. In Android Studio:
   - Select "Build" from the menu
   - Select "Generate Signed Bundle / APK"
   - Choose "APK"
   - Select your keystore and enter passwords
   - Choose "release" build type
   - Click "Finish"

3. The signed APK will be in:
   `/home/developer/Web Apps/boinvitedition/mobile/BoinvitApp/android/app/build/outputs/apk/release/app-release.apk`

4. Copy the APK to the downloads directory:
```bash
mkdir -p /home/developer/Web\ Apps/boinvitedition/public/downloads/
cp /home/developer/Web\ Apps/boinvitedition/mobile/BoinvitApp/android/app/build/outputs/apk/release/app-release.apk /home/developer/Web\ Apps/boinvitedition/public/downloads/boinvit-app.apk
```

## 9. Final Steps

After generating the APK:
1. Update the version info file
2. Test downloading the app from the website
3. Perform a final test of the production APK

This approach leverages the Android Studio UI instead of command-line tools, making it easier to build and test the app when certain CLI tools are missing.
