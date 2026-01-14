#!/bin/bash
# Build script for deployment

echo "Building frontend..."
cd frontend
npm install
npm run build

echo "Build complete! Frontend built to frontend/dist"
echo "Backend will serve the frontend from this directory"