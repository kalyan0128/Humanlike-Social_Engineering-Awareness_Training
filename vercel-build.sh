#!/bin/bash
set -e

echo "Starting Vercel build process for HumanLike-AwareBot..."

# Install dependencies including vite globally
echo "Installing dependencies..."
npm ci
npm install -g vite esbuild drizzle-kit

# Create .env file from Vercel environment variables if needed
echo "Setting up environment..."
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set"
else
  echo "Warning: DATABASE_URL is not set, database functionality may not work"
fi

# Build the client first
echo "Building client..."
cd client
vite build
cd ..

# Build the server
echo "Building server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Push database schema
if [ -n "$DATABASE_URL" ]; then
  echo "Pushing database schema..."
  drizzle-kit push:pg
else
  echo "Skipping database schema push due to missing DATABASE_URL"
fi

# Create the correct directory structure for Vercel deployment
mkdir -p dist/server/public

# Copy static files to the public directory
echo "Copying static assets..."
cp -r client/dist/* dist/server/public/

# Create necessary files for Vercel
# Create a simple index.js file for API routing
echo 'import { createServer } from "http";
import app from "./index.js";

// Create server
const server = createServer(app);

// For serverless use, export the app
export default app;
' > dist/index.js

echo "Build completed successfully!"