#!/bin/bash

# Boinvit Client App Setup Script
# This script sets up the development environment for the Boinvit Client App

echo "===== Setting up Boinvit for Booking client app ====="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p src/components
mkdir -p src/screens/auth
mkdir -p src/screens/bookings
mkdir -p src/screens/business
mkdir -p src/screens/payment
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/navigation
mkdir -p src/assets/images
mkdir -p src/assets/icons

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment template
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env || echo "SUPABASE_URL=your_supabase_url\nSUPABASE_KEY=your_supabase_key" > .env
    echo "Please update .env with your Supabase credentials."
fi

# Setup Android specific files
if [ -d "android" ]; then
    echo "Android directory exists, updating files..."
else
    echo "Setting up Android project..."
    npx react-native init temporary_project --template react-native-template-typescript
    mv temporary_project/android .
    rm -rf temporary_project
    
    # Update Android app name and package name
    echo "Updating Android configuration..."
    sed -i 's/app_name">.*</app_name">Boinvit for Booking</' android/app/src/main/res/values/strings.xml
fi

# Setup iOS specific files (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "ios" ]; then
        echo "iOS directory exists, updating files..."
    else
        echo "Setting up iOS project..."
        npx react-native init temporary_project --template react-native-template-typescript
        mv temporary_project/ios .
        rm -rf temporary_project
        
        # Update iOS app name and bundle identifier
        echo "Updating iOS configuration..."
        # This would require more complex manipulation of Info.plist and project files
        echo "Please manually update the iOS app name in Xcode."
    fi
fi

# Create app icon placeholder
echo "Creating app icon placeholder..."
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
touch src/assets/icons/app_icon.png
echo "Please replace app_icon.png with your actual app icon."

# Setup TypeScript configuration
echo "Setting up TypeScript..."
echo '{
  "compilerOptions": {
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "react-native",
    "lib": ["es2017"],
    "moduleResolution": "node",
    "noEmit": true,
    "strict": true,
    "target": "esnext",
    "baseUrl": ".",
    "paths": {
      "*": ["src/*"]
    }
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}' > tsconfig.json

# Create basic Supabase client
echo "Creating Supabase client..."
echo "import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
" > src/lib/supabase.ts

echo "===== Setup complete! ====="
echo "To start the development server, run: npm start"
echo "To run on Android, run: npm run android"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "To run on iOS, run: npm run ios"
fi
