# Netlify Deployment Notes

This document explains how to handle the Git submodule issues with Netlify deployments.

## The Issue

The repository contains a Git submodule at `mobile/BoinvitApp/BoinvitApp` which causes Netlify deployment failures because the submodule is not properly configured or accessible.

## Solution

We've implemented several fixes:

1. Added a `clean-submodules.sh` script that:
   - Removes all Git submodule references from the repository
   - Cleans up Git config files
   - Creates a placeholder README file

2. Updated the `netlify.toml` file to:
   - Run the cleanup script before building
   - Set Git environment variables to ignore submodules
   - Override submodule commands

3. Created an empty `.gitmodules` file to prevent Netlify from looking for submodules

## How to Deploy

When deploying to Netlify:

1. Make sure `clean-submodules.sh` is executable
2. Configure Netlify to use the `netlify.toml` file

## Long-term Solution

For a more permanent solution:

1. Properly set up the submodule with correct permissions
2. Or, move the mobile app to a separate repository entirely
3. Or, properly integrate the mobile app code without using Git submodules
