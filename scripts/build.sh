#!/bin/bash

# Build script to zip the src directory
# Usage: ./scripts/build.sh

set -e

cd "$(dirname "$0")/.."

if [ ! -d "src" ]; then
    echo "Error: src directory not found"
    exit 1
fi

[ -f "build.zip" ] && rm "build.zip"

zip -r "build.zip" src/

echo "Build complete: build.zip"
