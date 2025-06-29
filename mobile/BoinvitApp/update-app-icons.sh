#!/bin/bash

# This script downloads the Boinvit logo from the website and converts it to app icons

# Set up directory
cd "$(dirname "$0")"
TEMP_DIR="temp_icons"
mkdir -p $TEMP_DIR

echo "🖼️ Downloading Boinvit logo from website..."

# Download the logo (adjust URL if needed)
curl -s -o "$TEMP_DIR/boinvit-logo.png" https://boinvit.com/wp-content/uploads/2023/05/Boinvit-Logo-2.png || \
wget -q -O "$TEMP_DIR/boinvit-logo.png" https://boinvit.com/wp-content/uploads/2023/05/Boinvit-Logo-2.png

if [ ! -f "$TEMP_DIR/boinvit-logo.png" ]; then
  echo "❌ Failed to download logo. Please download the logo from boinvit.com manually"
  echo "   and place it in the $TEMP_DIR directory as boinvit-logo.png"
  exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick not found. Please install it with:"
  echo "   sudo apt-get install imagemagick"
  exit 1
fi

echo "🔄 Converting logo to Android icon sizes..."

# Android icon sizes
ANDROID_SIZES=(
  "mipmap-mdpi:48"
  "mipmap-hdpi:72"
  "mipmap-xhdpi:96"
  "mipmap-xxhdpi:144"
  "mipmap-xxxhdpi:192"
)

# Convert and generate Android icons
for SIZE_DEF in "${ANDROID_SIZES[@]}"; do
  FOLDER=$(echo $SIZE_DEF | cut -d ':' -f1)
  SIZE=$(echo $SIZE_DEF | cut -d ':' -f2)

  # Create square icon
  convert "$TEMP_DIR/boinvit-logo.png" -resize ${SIZE}x${SIZE} \
    -background white -gravity center -extent ${SIZE}x${SIZE} \
    "android/app/src/main/res/${FOLDER}/ic_launcher.png"

  # Create round icon
  convert "$TEMP_DIR/boinvit-logo.png" -resize ${SIZE}x${SIZE} \
    -background white -gravity center -extent ${SIZE}x${SIZE} \
    -alpha set -virtual-pixel transparent \
    -channel A -blur 0x8 -level 50%,100% +channel \
    "android/app/src/main/res/${FOLDER}/ic_launcher_round.png"

  echo "  ✅ Created ${FOLDER} icons (${SIZE}x${SIZE}px)"
done

echo "✅ App icons updated with Boinvit logo"
echo "🧹 Cleaning up temporary files..."
rm -rf $TEMP_DIR

echo "✨ Done! Your app now has the Boinvit logo as its icon."
