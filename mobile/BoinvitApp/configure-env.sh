#!/bin/bash

# Environment Configuration Script for Boinvit Mobile App
# This script updates all environment-specific configurations in the app

echo "==== Boinvit Mobile App Environment Configuration ===="

# Ask for environment
read -p "Set environment (dev/prod): " ENV

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
  echo "Error: Invalid environment. Use 'dev' or 'prod'."
  exit 1
fi

cd "$(dirname "$0")"
APP_DIR="$(pwd)"

# Base URL for the environment
DEV_URL="http://localhost:5173"
PROD_URL="https://boinvit.com"

if [ "$ENV" == "dev" ]; then
  BASE_URL=$DEV_URL
  IS_DEV=true
else
  BASE_URL=$PROD_URL
  IS_DEV=false
fi

echo -e "\n📱 Updating environment to: $ENV (URL: $BASE_URL)\n"

# Update PaymentScreen.tsx
echo "Updating PaymentScreen.tsx..."
sed -i "s|const isDevelopment = .*|const isDevelopment = $IS_DEV;|g" src/screens/PaymentScreen.tsx
sed -i "s|const baseUrl = isDevelopment.*|const baseUrl = isDevelopment ? '$DEV_URL' : '$PROD_URL';|g" src/screens/PaymentScreen.tsx

# Update any other files with URLs
find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "localhost:5173" | while read file; do
  echo "Updating URLs in $file..."
  if [ "$ENV" == "dev" ]; then
    # In development, ensure localhost URLs
    sed -i "s|https://boinvit.com|$DEV_URL|g" "$file"
  else
    # In production, ensure production URLs
    sed -i "s|http://localhost:5173|$PROD_URL|g" "$file"
  fi
done

# Remove console.logs in production
if [ "$ENV" == "prod" ]; then
  echo "Removing console.log statements..."
  find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "console.log" | while read file; do
    sed -i 's|console.log(.*);|// console.log removed for production|g' "$file"
  done
fi

echo -e "\n✅ Environment configuration updated to: $ENV"
echo "==== Configuration Complete ===="
