#!/bin/bash

# This script completely removes all Git submodule references
# which are causing Netlify deployment failures

echo "Starting submodule cleanup..."

# 1. Remove submodule directory if it exists
if [ -d "mobile/BoinvitApp/BoinvitApp" ]; then
  echo "Removing Git tracking from problematic directory..."
  rm -rf mobile/BoinvitApp/BoinvitApp/.git
fi

# 2. Remove any .gitmodules file
if [ -f ".gitmodules" ]; then
  echo "Removing .gitmodules file..."
  rm -f .gitmodules
  git add .gitmodules
fi

# 3. Remove submodule entries from git config
echo "Removing submodule entries from .git/config..."
git config --local --remove-section submodule.mobile/BoinvitApp/BoinvitApp 2>/dev/null || true

# 4. Remove submodule directory from git/modules
echo "Cleaning up .git/modules directory..."
rm -rf .git/modules/mobile/BoinvitApp/BoinvitApp 2>/dev/null || true

# 5. Remove from .git/config
git config -f .git/config --remove-section submodule.mobile/BoinvitApp/BoinvitApp 2>/dev/null || true

# 6. Remove any cached git entries
echo "Cleaning git cache..."
git rm --cached -r mobile/BoinvitApp/BoinvitApp 2>/dev/null || true

echo "Creating placeholder file in the directory..."
mkdir -p mobile/BoinvitApp
echo "# Mobile App Directory - Placeholder for Netlify deployment" > mobile/BoinvitApp/README-DEPLOYMENT.md

echo "Submodule cleanup complete!"
