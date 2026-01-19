#!/bin/bash
# Build script that conditionally builds based on BUILD_TARGET
# BUILD_TARGET can be: "mobile", "web", "extension", or unset (builds both)

set -e

case "$BUILD_TARGET" in
  mobile)
    echo "Building for mobile (native only)..."
    pnpm build:native
    ;;
  web|extension)
    echo "Building for $BUILD_TARGET (web only)..."
    pnpm build:web
    ;;
  *)
    echo "Building for all targets (native + web)..."
    pnpm build:native
    pnpm build:web
    ;;
esac
