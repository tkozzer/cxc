#!/bin/bash

# Chrono X Chroma - Build Script
# Creates a minimal extension package for distribution

set -e

echo "🚀 Building Chrono X Chroma Extension..."

# Create build directory
rm -rf build
mkdir -p build

# Compile TypeScript content script directly to build directory
echo "🔧 Compiling TypeScript content script..."
tsc content.ts --outDir build --module ESNext --target ES2020 --esModuleInterop false --allowJs false --noEmit false --declaration false

# Build the Vite project
echo "📦 Building Vite project..."
pnpm run build

# Copy essential extension files to build directory
echo "📂 Copying extension files..."

# Core extension files
cp manifest.json build/
cp styles.css build/

# Icons
cp -r icons build/

# Built popup files (from Vite)
cp -r dist build/

# Documentation
cp README.md build/
cp LICENSE build/

echo "🧹 Cleaning up build..."

# Remove development files from build
rm -rf build/dist/src/style.css.map 2>/dev/null || true

# Clean up any content.js file in root directory (from previous builds)
rm -f content.js

# Clean up any old JavaScript files that should be TypeScript
rm -f src/popup.js

# Create extension package
echo "📦 Creating extension package..."
cd build
zip -r ../chrono-x-chroma-extension.zip . -x "*.DS_Store" "*.map"
cd ..

# Calculate file sizes
BUILD_SIZE=$(du -sh build | cut -f1)
ZIP_SIZE=$(du -sh chrono-x-chroma-extension.zip | cut -f1)

echo "✅ Build complete!"
echo "📊 Build directory: $BUILD_SIZE"
echo "📊 Extension package: $ZIP_SIZE"
echo "📁 Extension package: chrono-x-chroma-extension.zip"
echo ""
echo "🔧 To load the extension:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select the 'build' directory"
echo ""
echo "📤 To distribute:"
echo "Use the chrono-x-chroma-extension.zip file" 