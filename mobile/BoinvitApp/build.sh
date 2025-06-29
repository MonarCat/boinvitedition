#!/bin/bash

# Boinvit Mobile App Build Script
echo "==== Boinvit Mobile App Build Process ===="
echo "This script will build the Android APK and prepare it for distribution."

# Navigate to the app directory
cd "$(dirname "$0")"
APP_DIR="$(pwd)"

# Check if environment is set up correctly
if [ ! -d "node_modules" ]; then
  echo "❌ Node modules not found. Please run setup.sh first."
  exit 1
fi

echo -e "\n📱 Building Release APK...\n"

# Set the development flag to false in PaymentScreen.tsx
echo "Setting production environment..."
sed -i 's/const isDevelopment = true/const isDevelopment = false/g' src/screens/PaymentScreen.tsx

# Build the APK
echo "Running Gradle build..."
npm run build:android

# Check if build was successful
if [ ! -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
  echo "❌ Build failed. APK not found."
  exit 1
fi

# Copy the APK to the downloads directory
echo "Copying APK to downloads directory..."
mkdir -p ../../public/downloads
cp android/app/build/outputs/apk/release/app-release.apk ../../public/downloads/boinvit-app.apk

# Generate version info file
echo "Generating version info..."
VERSION=$(grep '"version":' package.json | cut -d'"' -f4)
BUILD_DATE=$(date +"%Y-%m-%d %H:%M:%S")
cat > ../../public/downloads/app-version.json << EOF
{
  "version": "$VERSION",
  "buildDate": "$BUILD_DATE",
  "releaseNotes": "Initial release with booking and payment features"
}
EOF

# Set the development flag back to true for development
echo "Resetting development environment..."
sed -i 's/const isDevelopment = false/const isDevelopment = true/g' src/screens/PaymentScreen.tsx

echo -e "\n✅ Build completed successfully!"
echo -e "📱 APK location: ../../public/downloads/boinvit-app.apk"
echo -e "📋 Version info: ../../public/downloads/app-version.json"

echo "==== Build Process Complete ===="
