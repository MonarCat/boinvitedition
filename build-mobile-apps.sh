#!/bin/bash

# Build script for both Boinvit apps
# This script builds the Business app and Client app APKs and copies them to the public downloads directory

# Set error handling
set -e

# Path variables
BUSINESS_APP_PATH="mobile/BoinvitApp"
CLIENT_APP_PATH="mobile/ClientApp"
PUBLIC_DOWNLOADS_PATH="public/downloads"
VERSION_FILE_PATH="$PUBLIC_DOWNLOADS_PATH/app-version.json"

# Make sure we're in the project root
if [ ! -d "$BUSINESS_APP_PATH" ] || [ ! -d "$CLIENT_APP_PATH" ]; then
    echo "Error: Must run this script from the project root directory."
    exit 1
fi

# Create downloads directory if it doesn't exist
mkdir -p $PUBLIC_DOWNLOADS_PATH

# Build and get version of Business app
echo "===== Building Boinvit Business App ====="
cd $BUSINESS_APP_PATH
npm install
npm run build:android

# Copy Business app APK to public downloads
cp android/app/build/outputs/apk/release/app-release.apk ../../$PUBLIC_DOWNLOADS_PATH/boinvit-app.apk
BUSINESS_VERSION=$(node -e "console.log(require('./package.json').version)")
cd ../..

# Build and get version of Client app
echo "===== Building Boinvit Client App ====="
cd $CLIENT_APP_PATH
npm install
npm run build:android

# Copy Client app APK to public downloads
cp android/app/build/outputs/apk/release/app-release.apk ../../$PUBLIC_DOWNLOADS_PATH/boinvit-client.apk
CLIENT_VERSION=$(node -e "console.log(require('./package.json').version)")
cd ../..

# Create or update version file
echo "Updating version information..."
BUILD_DATE=$(date +"%Y-%m-%d")

cat > $VERSION_FILE_PATH << EOL
{
    "businessApp": {
        "version": "$BUSINESS_VERSION",
        "buildDate": "$BUILD_DATE",
        "url": "/downloads/boinvit-app.apk",
        "minAndroidVersion": 24
    },
    "clientApp": {
        "version": "$CLIENT_VERSION",
        "buildDate": "$BUILD_DATE",
        "url": "/downloads/boinvit-client.apk",
        "minAndroidVersion": 24
    }
}
EOL

echo "===== Build Complete ====="
echo "Business App: v$BUSINESS_VERSION"
echo "Client App: v$CLIENT_VERSION"
echo "APKs copied to $PUBLIC_DOWNLOADS_PATH"
echo "Version information updated at $VERSION_FILE_PATH"
