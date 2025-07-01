#!/bin/bash

# This script runs before the Netlify build to fix submodule issues

echo "Running pre-build script to handle submodule..."

# Remove .gitmodules file which has incorrect URL
if [ -f ".gitmodules" ]; then
  echo "Removing .gitmodules file"
  rm -f .gitmodules
fi

# If the submodule directory exists, remove it from git tracking
if [ -d "mobile/BoinvitApp/BoinvitApp" ]; then
  echo "Removing Git tracking from nested BoinvitApp directory"
  rm -rf mobile/BoinvitApp/BoinvitApp/.git
  
  # Also remove any submodule entry in .git/config
  git config --local --remove-section submodule.mobile/BoinvitApp/BoinvitApp 2>/dev/null || true
fi

# Create a placeholder file in the directory if it doesn't exist
if [ ! -f "mobile/BoinvitApp/BoinvitApp/README.md" ]; then
  echo "Creating placeholder README in BoinvitApp directory"
  mkdir -p mobile/BoinvitApp/BoinvitApp
  echo "# Placeholder for mobile app" > mobile/BoinvitApp/BoinvitApp/README.md
fi

echo "Pre-build script completed successfully"
