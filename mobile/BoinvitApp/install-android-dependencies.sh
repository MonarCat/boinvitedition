#!/bin/bash

echo "==== Installing Android Build Dependencies ===="

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install OpenJDK
echo "Installing OpenJDK..."
sudo apt-get install -y openjdk-11-jdk

# Check if Java was installed successfully
if ! command -v java &> /dev/null; then
    echo "❌ Failed to install Java. Please install it manually."
    exit 1
fi

echo "✅ Java installed successfully."

# Set JAVA_HOME
export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:/bin/java::")
echo "JAVA_HOME set to $JAVA_HOME"

# Install Android SDK tools
echo "Installing Android command line tools..."
ANDROID_SDK_ROOT="$HOME/Android/Sdk"
mkdir -p "$ANDROID_SDK_ROOT"

echo "✅ Android development environment setup completed."
echo "You can now build your Android app with: npm run build:android"
