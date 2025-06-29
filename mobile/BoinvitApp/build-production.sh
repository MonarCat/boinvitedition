#!/bin/bash

# Set environment variables
export JAVA_HOME=/usr/local/android-studio/jbr
export ANDROID_SDK_ROOT=/home/developer/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$PATH

# Output environment info
echo "Building React Native Android app for production with environment:"
echo "JAVA_HOME=$JAVA_HOME"
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Navigate to project directory
cd "$(dirname "$0")"

# Create a production .env file if needed
if [ ! -f .env.production ]; then
  echo "Creating .env.production file..."
  cat > .env.production << EOF
API_URL=https://api.boinvit.com
WEBVIEW_BASE_URL=https://boinvit.com
STRIPE_PUBLISHABLE_KEY=pk_test_yourkey
ENVIRONMENT=production
EOF
  echo "✅ Created .env.production file with default settings."
  echo "   Please edit it with your actual production API endpoints."
fi

# Set environment to production
echo "Setting environment to production..."
cp .env.production .env 2>/dev/null || true

# Clean the build directory
echo "Cleaning Android build directory..."
cd android && ./gradlew clean

# Debug: Check if the React Native module exists
if [ ! -d "../node_modules/react-native" ]; then
  echo "⚠️ React Native not found in node_modules. Running npm install..."
  cd .. && npm install && cd android
fi

# Debug: List important directories and files
echo "Debug: Listing important React Native directories..."
ls -la ../node_modules/react-native 2>/dev/null || echo "React Native directory not found!"
ls -la ../node_modules/@react-native-community 2>/dev/null || echo "React Native community directory not found!"

# Debug: Check gradle.properties
echo "Debug: Checking gradle.properties..."
cat gradle.properties 2>/dev/null || echo "gradle.properties not found!"

# Enable Hermes engine for better performance
echo "Ensuring Hermes engine is enabled for performance..."
if ! grep -q "hermesEnabled=true" gradle.properties; then
  echo "hermesEnabled=true" >> gradle.properties
fi

# Build release APK and Bundle
echo "Building release bundle/APK..."
./gradlew assembleRelease bundleRelease --stacktrace

# Check if the build was successful
if [ $? -eq 0 ] && [ -f app/build/outputs/apk/release/app-release.apk ]; then
  echo ""
  echo "✅ Build complete! Production files can be found at:"
  echo " - APK: app/build/outputs/apk/release/app-release.apk"
  echo " - AAB: app/build/outputs/bundle/release/app-release.aab"
  echo ""
  echo "The AAB file is what you should upload to Google Play Store."
  echo "The APK file can be used for direct distribution or testing."
  echo ""
  echo "📱 Next steps:"
  echo "1. Test the APK on real devices before distribution"
  echo "2. Create a Google Play Console account if you don't have one"
  echo "3. Create a new app in the Play Console and upload your AAB file"
  echo "4. Fill out the store listing, content rating, and pricing details"
  echo "5. Submit your app for review"
  cd ..
  exit 0
else
  echo ""
  echo "❌ Build failed! See errors above."
  echo "Possible issues to check:"
  echo " - Make sure your React Native dependencies are correctly installed"
  echo " - Check the signing configuration in app/build.gradle"
  echo " - Make sure the keystore file exists and has the right password"
  cd ..
  exit 1
fi
