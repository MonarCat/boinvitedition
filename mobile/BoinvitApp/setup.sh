#!/bin/bash

# Boinvit Mobile App Setup Script
echo "==== Boinvit Mobile App Setup ===="
echo "This script will set up your development environment for the Boinvit mobile app."

# Navigate to the app directory
cd "$(dirname "$0")"
APP_DIR="$(pwd)"

echo -e "\n📱 Setting up React Native environment...\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies
echo -e "\n📦 Installing dependencies...\n"
npm install

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo -e "\n⚠️ ANDROID_HOME environment variable not set."
    echo "You may need to set up Android SDK for development."
fi

# Install react-native-cli globally if not installed
if ! command -v react-native &> /dev/null; then
    echo -e "\n📲 Installing React Native CLI globally...\n"
    npm install -g react-native-cli
fi

echo -e "\n✅ Dependencies installed successfully!"
echo -e "\n💡 Next steps:"
echo "1. To start the development server: npm start"
echo "2. To run on Android: npm run android"
echo "3. To build an APK: cd android && ./gradlew assembleRelease"

# Create APK directory in public folder if it doesn't exist
PUBLIC_DIR="../../public/downloads"
mkdir -p "$PUBLIC_DIR"

echo -e "\n🎯 APK output directory set up at: public/downloads"
echo -e "When you build your APK, copy it to this directory for distribution.\n"
echo "==== Setup Complete ===="
