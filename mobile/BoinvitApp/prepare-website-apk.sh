#!/bin/bash

# Set environment variables
export JAVA_HOME=/usr/local/android-studio/jbr
export ANDROID_SDK_ROOT=/home/developer/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$PATH

# Output environment info
echo "Preparing Boinvit APK for website distribution..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Create website distribution directory
WEBSITE_DIST="website-distribution"
mkdir -p $WEBSITE_DIST

# Get version info
VERSION=$(grep -o 'versionName "[^"]*"' android/app/build.gradle | cut -d'"' -f2)
BUILD=$(grep -o 'versionCode [0-9]*' android/app/build.gradle | awk '{print $2}')

# Set filename
APK_FILENAME="boinvit-$VERSION-$BUILD.apk"
DOWNLOAD_URL="https://boinvit.com/download/$APK_FILENAME"

# Check if keystore exists - create if needed
if [ ! -f android/app/boinvit-app-key.keystore ]; then
  echo "⚠️ Production keystore not found! Creating one now..."
  ./create-production-keystore.sh

  if [ $? -ne 0 ]; then
    echo "❌ Failed to create keystore. Please run create-production-keystore.sh manually."
    exit 1
  fi
fi

# Try to build the production APK
echo "Building production APK..."
HAS_REAL_APK=false

# Check if there's an existing APK we can use
if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then
  echo "✅ Found existing release APK, using it..."
  cp android/app/build/outputs/apk/release/app-release.apk "$WEBSITE_DIST/$APK_FILENAME"
  HAS_REAL_APK=true
else
  # Try building the APK
  ./build-production.sh

  if [ $? -eq 0 ] && [ -f android/app/build/outputs/apk/release/app-release.apk ]; then
    echo "✅ Build successful!"
    # Copy and rename APK for website
    cp android/app/build/outputs/apk/release/app-release.apk "$WEBSITE_DIST/$APK_FILENAME"
    HAS_REAL_APK=true
  else
    echo "⚠️ Build had issues or APK not found."
    echo "   Creating a placeholder APK for website demonstration purposes."

    # Create a placeholder APK file
    echo "Creating placeholder APK file for website demonstration..."
    touch "$WEBSITE_DIST/$APK_FILENAME"
    cat > "$WEBSITE_DIST/$APK_FILENAME" << EOF
This is a placeholder file.
The actual Boinvit app APK will be available soon.
EOF
  fi
fi

# Calculate file size
if [ "$HAS_REAL_APK" = true ]; then
  FILE_SIZE=$(du -h "$WEBSITE_DIST/$APK_FILENAME" | cut -f1)
  echo "✅ Real APK copied to $WEBSITE_DIST/$APK_FILENAME (Size: $FILE_SIZE)"
else
  FILE_SIZE="< 1KB (placeholder)"
  echo "⚠️ Placeholder APK created at $WEBSITE_DIST/$APK_FILENAME"
fi

# Generate QR code for easy download (if qrencode is installed)
if command -v qrencode &> /dev/null; then
  qrencode -o "$WEBSITE_DIST/download-qr.png" "$DOWNLOAD_URL"
  echo "✅ QR code generated at $WEBSITE_DIST/download-qr.png"
else
  echo "⚠️ qrencode not installed. QR code not generated."
  echo "   Install it with: sudo apt-get install qrencode"

  # Create a placeholder QR code image
  echo "Creating placeholder QR code image..."
  cat > "$WEBSITE_DIST/download-qr.png" << EOF
This is a placeholder for the QR code image.
Please install qrencode with: sudo apt-get install qrencode
EOF
fi

# Create version.json file with app information
cat > "$WEBSITE_DIST/version.json" << EOF
{
  "version": "$VERSION",
  "buildNumber": $BUILD,
  "fileName": "$APK_FILENAME",
  "downloadUrl": "$DOWNLOAD_URL",
  "fileSize": "$FILE_SIZE",
  "releaseDate": "$(date +"%Y-%m-%d")",
  "minAndroidVersion": "5.0",
  "isPlaceholder": $([ "$HAS_REAL_APK" = true ] && echo "false" || echo "true")
}
EOF
echo "✅ App info file generated at $WEBSITE_DIST/version.json"

# Create HTML snippet for website embedding
cat > "$WEBSITE_DIST/download-snippet.html" << EOF
<!-- Boinvit App Download Button -->
<div class="boinvit-app-download">
  <h3>Download Boinvit App</h3>
  <p>Version $VERSION (build $BUILD) - $FILE_SIZE</p>
  <a href="$DOWNLOAD_URL" class="download-button">Download for Android</a>
  <p class="small">Requires Android 5.0 or higher</p>
  <div class="qr-container">
    <p>Or scan this QR code:</p>
    <img src="download-qr.png" alt="Download QR Code" width="150">
  </div>
</div>
<!-- End Boinvit App Download Button -->
EOF
echo "✅ HTML snippet created at $WEBSITE_DIST/download-snippet.html"

# Copy logo for website display
if [ -f src/assets/logo.png ]; then
  cp src/assets/logo.png "$WEBSITE_DIST/app-logo.png"
  echo "✅ App logo copied to $WEBSITE_DIST/app-logo.png"
else
  echo "⚠️ App logo not found at src/assets/logo.png"
  echo "   Please add a logo file to complete the website distribution package."
fi

# Create a sample download page to include in the distribution
cat > "$WEBSITE_DIST/download.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Boinvit App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .boinvit-app-download {
            background-color: #f5f5f5;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .download-button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
        }
        .small {
            font-size: 0.8em;
            color: #666;
        }
        .qr-container {
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>Download Boinvit App</h1>
    <p>Get the latest version of our mobile app for the best experience.</p>

    <!-- Boinvit App Download Button -->
    <div class="boinvit-app-download">
        <h3>Download Boinvit App</h3>
        <p>Version $VERSION (build $BUILD) - $FILE_SIZE</p>
        <a href="$APK_FILENAME" class="download-button">Download for Android</a>
        <p class="small">Requires Android 5.0 or higher</p>
        <div class="qr-container">
            <p>Or scan this QR code:</p>
            <img src="download-qr.png" alt="Download QR Code" width="150">
        </div>
    </div>

    <h3>Installation Instructions</h3>
    <ol>
        <li>Download the APK file by clicking the button above.</li>
        <li>Open the downloaded file on your Android device.</li>
        <li>If prompted, enable installation from unknown sources in your device settings.</li>
        <li>Follow the on-screen instructions to complete the installation.</li>
        <li>Once installed, open the app and enjoy!</li>
    </ol>

    <p class="small">© 2025 Boinvit. All rights reserved.</p>
</body>
</html>
EOF
echo "✅ Sample download page created at $WEBSITE_DIST/download.html"

echo ""
echo "🎉 Website distribution package created successfully!"
echo ""
echo "📋 Instructions for website integration:"
echo " 1. Upload all files from the '$WEBSITE_DIST' directory to your website"
echo " 2. Place the files in a '/download' directory on https://boinvit.com/"
echo " 3. Add the HTML from download-snippet.html to your website's download page"
echo " 4. Or use the provided download.html as a complete download page"
echo " 5. The version.json file can be used to automatically update version info on the website"
echo ""
if [ "$HAS_REAL_APK" = true ]; then
  echo "Users can now download the app directly from your website or by scanning the QR code!"
else
  echo "⚠️ Note: A placeholder APK was created since the build process failed."
  echo "   Once you fix the build issues, run this script again to include the real APK."
fi
