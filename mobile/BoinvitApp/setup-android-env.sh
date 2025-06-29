#!/bin/bash

# Set up JAVA_HOME to use Android Studio's JBR
export JAVA_HOME=/usr/local/android-studio/jbr
export PATH=$JAVA_HOME/bin:$PATH

# Set Android SDK environment variables based on local.properties
ANDROID_SDK_ROOT="/home/developer/Android/Sdk"
export ANDROID_SDK_ROOT
export PATH="$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

echo "Environment configured:"
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo "Java version:"
$JAVA_HOME/bin/java -version
echo "ADB version:"
$ANDROID_SDK_ROOT/platform-tools/adb version

# Add these variables to .bashrc for persistence if they don't exist
if ! grep -q "JAVA_HOME=/usr/local/android-studio/jbr" ~/.bashrc; then
  echo -e "\n# Android development environment" >> ~/.bashrc
  echo "export JAVA_HOME=/usr/local/android-studio/jbr" >> ~/.bashrc
  echo "export ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT" >> ~/.bashrc
  echo "export PATH=\$JAVA_HOME/bin:\$ANDROID_SDK_ROOT/tools:\$ANDROID_SDK_ROOT/tools/bin:\$ANDROID_SDK_ROOT/platform-tools:\$PATH" >> ~/.bashrc
  echo "Environment variables added to ~/.bashrc"
fi

echo -e "\nTo use these settings in your current terminal, run:"
echo "source $(pwd)/setup-android-env.sh"
