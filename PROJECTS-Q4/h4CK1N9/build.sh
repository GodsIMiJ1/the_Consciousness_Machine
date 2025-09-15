#!/bin/bash

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define project directories
FRONTEND_DIR="$SCRIPT_DIR/the-repeater-frontend"
BACKEND_DIR="$SCRIPT_DIR/the-repeater-backend"

# Build the frontend project
echo "Building the frontend project..."
cd "$FRONTEND_DIR" || exit
npm install
npm run build
echo "Frontend build completed successfully!"

# Build the backend project
echo "Building the backend project..."
cd "$BACKEND_DIR" || exit
npm install
echo "Backend build completed successfully!"

echo "Both frontend and backend projects have been built successfully!"
