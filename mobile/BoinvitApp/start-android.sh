#!/bin/bash

# Set environment variables
export JAVA_HOME=/usr/local/android-studio/jbr
export ANDROID_SDK_ROOT=/home/developer/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$PATH

# Run the React Native app
echo "Starting React Native Android app with environment:"
echo "JAVA_HOME=$JAVA_HOME"
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Check if emulator is connected
DEVICES=$($ANDROID_SDK_ROOT/platform-tools/adb devices | grep -v "List" | grep "device" | wc -l)
if [ "$DEVICES" -eq 0 ]; then
  echo "No Android devices/emulators connected. Will attempt to start an emulator..."

  # List available emulators
  echo "Available emulators:"
  $ANDROID_SDK_ROOT/tools/emulator -list-avds || echo "No emulators found. Please create one in Android Studio."

  # Try to start the first available emulator
  FIRST_AVD=$($ANDROID_SDK_ROOT/tools/emulator -list-avds | head -n 1)
  if [ -n "$FIRST_AVD" ]; then
    echo "Starting emulator: $FIRST_AVD"
    $ANDROID_SDK_ROOT/tools/emulator -avd "$FIRST_AVD" &
    echo "Waiting for emulator to boot..."
    sleep 5
  fi
fi

# Kill any Metro process using port 8081
echo "Ensuring Metro bundler port is available..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "No process using port 8081"

# Start the app
echo "Starting React Native app..."
cd "$(dirname "$0")"
npx react-native run-android
