#!/bin/bash
# Build script for iOS static export
# Temporarily moves API routes since they're hosted on Vercel

echo "Building for iOS (static export)..."

# Function to restore API routes
restore_api() {
  if [ -d ".api-backup" ]; then
    mv .api-backup app/api
    echo "Restored API routes"
  fi
}

# Trap to restore on any exit (success or failure)
trap restore_api EXIT

# Move API routes completely outside app directory
if [ -d "app/api" ]; then
  mv app/api .api-backup
  echo "Moved API routes aside"
fi

# Clean previous build
rm -rf .next out

# Run the static export build
STATIC_EXPORT=true pnpm next build

echo "Syncing to Capacitor iOS..."
npx cap sync ios

echo "iOS build complete! Run 'npx cap open ios' to open in Xcode"
