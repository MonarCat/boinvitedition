#!/bin/bash

# Location variables
APP_DIR="$(pwd)"
ANDROID_DIR="$APP_DIR/android"
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets"
BUNDLE_FILE="$ASSETS_DIR/index.android.bundle"
APK_OUTPUT="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
WEBSITE_DIR="../../public/downloads"

echo "==== Building Boinvit App APK ===="

# Create assets directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

# Find the correct entry file
ENTRY_FILE=""
if [ -f "$APP_DIR/index.js" ]; then
    ENTRY_FILE="index.js"
elif [ -f "$APP_DIR/index.jsx" ]; then
    ENTRY_FILE="index.jsx"
elif [ -f "$APP_DIR/src/index.js" ]; then
    ENTRY_FILE="src/index.js"
else
    echo "❌ Could not find entry file (index.js)"
    ls -la "$APP_DIR"
    exit 1
fi

echo "✅ Found entry file: $ENTRY_FILE"

# Create an empty index.js file if it doesn't exist (temporary fix)
if [ "$ENTRY_FILE" = "" ]; then
    echo "Creating a temporary entry file..."
    echo "import {AppRegistry} from 'react-native';" > "$APP_DIR/index.js"
    echo "import App from './App';" >> "$APP_DIR/index.js"
    echo "import {name as appName} from './app.json';" >> "$APP_DIR/index.js"
    echo "AppRegistry.registerComponent(appName, () => App);" >> "$APP_DIR/index.js"
    ENTRY_FILE="index.js"
    echo "✅ Created temporary entry file: $ENTRY_FILE"
fi

# Bundle the JavaScript
echo "📦 Bundling JavaScript..."
npx react-native bundle --platform android --dev false --entry-file "$ENTRY_FILE" \
  --bundle-output "$BUNDLE_FILE" --assets-dest "$ANDROID_DIR/app/src/main/res/" || {
    echo "❌ JavaScript bundling failed"
    exit 1
}

# Build the release APK
echo "🔨 Building release APK..."
cd "$ANDROID_DIR" && ./gradlew clean assembleRelease || {
    echo "❌ APK build failed"
    exit 1
}

# Check if build was successful
if [ -f "$APK_OUTPUT" ]; then
    echo "✅ APK built successfully: $APK_OUTPUT"

    # Copy to website directory if it exists
    if [ -d "$WEBSITE_DIR" ]; then
        cp "$APK_OUTPUT" "$WEBSITE_DIR/boinvit-app.apk"
        echo "✅ APK copied to website download directory"
    else
        echo "⚠️ Website download directory not found at $WEBSITE_DIR"
        echo "Creating directory and copying APK..."
        mkdir -p "$WEBSITE_DIR"
        cp "$APK_OUTPUT" "$WEBSITE_DIR/boinvit-app.apk"
        echo "✅ APK copied to newly created website download directory"
    fi
else
    echo "❌ APK build failed - file not found"
    exit 1
fi

echo "==== Build process completed ===="
