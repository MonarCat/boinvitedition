#!/bin/bash

# If the submodule directory exists, remove it from git tracking
if [ -d "mobile/BoinvitApp/BoinvitApp" ]; then
  echo "Removing Git tracking from nested BoinvitApp directory"
  rm -rf mobile/BoinvitApp/BoinvitApp/.git
  
  # Also remove any submodule entry in .git/config
  git config --local --remove-section submodule.mobile/BoinvitApp/BoinvitApp 2>/dev/null || true
fi

echo "Submodule cleanup complete"
