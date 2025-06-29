#!/bin/bash

# This script helps create a production keystore for signing your Android app
# WARNING: Keep your keystore file and passwords safe. If you lose them, you cannot update your app on the Play Store.

# Set environment variables
export JAVA_HOME=/usr/local/android-studio/jbr

echo "===== Boinvit App Production Keystore Generation ====="
echo "This will create a keystore file for signing your production app."
echo "IMPORTANT: Save the passwords and keystore file in a secure location!"
echo ""

# Default values
DEFAULT_KEYSTORE_FILE="boinvit-app-key.keystore"
KEY_ALIAS="boinvit-key"
VALIDITY=10000 # ~27 years

# Get keystore file path from user
read -p "Enter keystore file path [$DEFAULT_KEYSTORE_FILE]: " KEYSTORE_FILE
KEYSTORE_FILE=${KEYSTORE_FILE:-$DEFAULT_KEYSTORE_FILE}

# Get password (with confirmation)
echo ""
echo "Create keystore password:"
while true; do
  read -s -p "Enter keystore password: " STORE_PASS
  echo ""
  read -s -p "Confirm keystore password: " STORE_PASS_CONFIRM
  echo ""

  if [ "$STORE_PASS" = "$STORE_PASS_CONFIRM" ]; then
    break
  else
    echo "⚠️ Passwords don't match. Please try again."
  fi
done

# Create a simple password file to pass to keytool
echo -n "$STORE_PASS" > temp_store_pass.txt

# Generate the keystore with explicit parameters
echo ""
echo "Generating keystore..."
$JAVA_HOME/bin/keytool -genkeypair \
  -keystore "$KEYSTORE_FILE" \
  -storepass:file temp_store_pass.txt \
  -alias "$KEY_ALIAS" \
  -keypass:file temp_store_pass.txt \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY \
  -dname "CN=Boinvit App, OU=Mobile, O=Boinvit, L=Unknown, S=Unknown, C=US" \
  -v

# Remove the temporary password file
rm temp_store_pass.txt

# Check if generation was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Keystore generated successfully: $KEYSTORE_FILE"
  echo ""

  # Copy the keystore to the app directory
  mkdir -p "$(dirname "$0")/android/app"
  cp "$KEYSTORE_FILE" "$(dirname "$0")/android/app/"
  echo "✅ Keystore copied to android/app/$KEYSTORE_FILE"

  # Create or update gradle.properties
  GRADLE_PROPERTIES=~/.gradle/gradle.properties
  mkdir -p ~/.gradle

  # Remove old Boinvit entries if they exist
  if [ -f "$GRADLE_PROPERTIES" ]; then
    grep -v "BOINVIT_UPLOAD_" "$GRADLE_PROPERTIES" > "${GRADLE_PROPERTIES}.tmp" || true
    mv "${GRADLE_PROPERTIES}.tmp" "$GRADLE_PROPERTIES"
  fi

  # Add new signing properties
  echo "" >> "$GRADLE_PROPERTIES"
  echo "# Boinvit App signing properties" >> "$GRADLE_PROPERTIES"
  echo "BOINVIT_UPLOAD_STORE_FILE=$KEYSTORE_FILE" >> "$GRADLE_PROPERTIES"
  echo "BOINVIT_UPLOAD_KEY_ALIAS=$KEY_ALIAS" >> "$GRADLE_PROPERTIES"
  echo "BOINVIT_UPLOAD_STORE_PASSWORD=$STORE_PASS" >> "$GRADLE_PROPERTIES"
  echo "BOINVIT_UPLOAD_KEY_PASSWORD=$STORE_PASS" >> "$GRADLE_PROPERTIES"

  echo "✅ Signing properties added to $GRADLE_PROPERTIES"
  echo ""
  echo "⚠️  WARNING: Keep this information secure - if you lose this keystore or passwords,"
  echo "   you will not be able to update your app on the Google Play Store!"
else
  echo "❌ Failed to generate keystore. Please check the error message above."
fi
