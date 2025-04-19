#!/bin/bash

# This script runs during Vercel build to set up the project correctly

echo "Starting Vercel build process..."

# Run the main build process
npm run build

# Create public directory in the server directory for static files
mkdir -p dist/server/public

# Copy client files to the server/public directory where vite.ts expects them
echo "Copying client files to server/public directory..."
cp -r dist/client/* dist/server/public/

echo "Vercel build completed successfully!"