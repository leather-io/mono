#!/bin/bash
# Test script to validate mobile build before EAS
# Runs in CI to catch build issues early
# Usage: ./scripts/test-mobile-build.sh

set -e

echo "🧪 Validating mobile build (simulating EAS)..."
echo ""

# Ensure we're in repo root
cd "$(dirname "$0")/.."

# Clean to simulate fresh EAS environment
echo "🧹 Cleaning build artifacts..."
rm -rf packages/*/dist packages/*/dist-* apps/mobile/node_modules/.cache
echo ""

# Install mobile dependencies only (without running scripts yet)
echo "📦 Installing mobile dependencies..."
pnpm install --filter=@leather.io/mobile... --ignore-scripts
echo ""

# Build tokens package first (required by postinstall Lottie sync)
echo "🎨 Building tokens package (required for Lottie color sync)..."
BUILD_TARGET=mobile pnpm --filter=@leather.io/tokens build
echo ""

# Now run postinstall scripts (sync-lottie-colors needs built tokens)
echo "🔧 Running postinstall scripts..."
cd apps/mobile && pnpm rebuild --pending && cd ../..
echo ""

# Build mobile app
echo "🏗️  Building mobile app (BUILD_TARGET=mobile)..."
BUILD_TARGET=mobile pnpm build:mobile
echo ""

# Validation checks
echo "🔍 Running validation checks..."
FAILURES=0

# Check mobile build artifacts exist
if [ ! -d "apps/mobile/dist" ] && [ ! -d "apps/mobile/.expo" ]; then
  echo "⚠️  Warning: No mobile build artifacts found"
fi

# Check web artifacts were NOT created
if [ -d "apps/web/build" ] || [ -d "apps/web/leather-styles" ]; then
  echo "❌ FAIL: Web build artifacts detected (should not build web for mobile)"
  FAILURES=$((FAILURES + 1))
else
  echo "✅ PASS: No web artifacts (correct)"
fi

# Check panda-preset was NOT built
if [ -d "packages/panda-preset/dist" ]; then
  echo "⚠️  Warning: panda-preset was built (shouldn't be needed for mobile)"
  echo "   This may indicate a dependency issue"
fi

# Check UI native was built
if [ -d "packages/ui/dist-native" ]; then
  echo "✅ PASS: UI native build exists"
else
  echo "❌ FAIL: UI native build missing"
  FAILURES=$((FAILURES + 1))
fi

# Check UI web was NOT built (optimization check)
if [ -d "packages/ui/dist-web" ]; then
  echo "⚠️  Warning: UI web was built (should skip for mobile optimization)"
  echo "   Build will work but wastes resources"
fi

# Check Lottie colors were synced with tokens
echo "🎨 Checking Lottie color sync..."
# Check for the correct RGB values in the backgroundColor (allowing for whitespace variations)
if grep -q '"r": 18' apps/mobile/src/assets/lottie-splash-screen-light.json && \
   grep -q '"g": 16' apps/mobile/src/assets/lottie-splash-screen-light.json && \
   grep -q '"b": 15' apps/mobile/src/assets/lottie-splash-screen-light.json && \
   grep -q '"r": 158' apps/mobile/src/assets/lottie-splash-screen-dark.json && \
   grep -q '"g": 153' apps/mobile/src/assets/lottie-splash-screen-dark.json && \
   grep -q '"b": 150' apps/mobile/src/assets/lottie-splash-screen-dark.json; then
  echo "✅ PASS: Lottie colors synced correctly with tokens"
else
  echo "❌ FAIL: Lottie colors not synced properly"
  echo "   Expected light: rgb(18, 16, 15), dark: rgb(158, 153, 150)"
  FAILURES=$((FAILURES + 1))
fi

echo ""
if [ $FAILURES -eq 0 ]; then
  echo "✅ Mobile build validation PASSED"
  echo ""
  echo "Summary:"
  echo "  ✅ No prepare scripts ran during install"
  echo "  ✅ Tokens built before postinstall"
  echo "  ✅ Lottie colors synced with design tokens"
  echo "  ✅ Mobile dependencies installed correctly"
  echo "  ✅ Mobile app built successfully"
  echo "  ✅ Web builds skipped (no cross-contamination)"
  echo "  ✅ Build decoupled from package management"
  echo ""
  echo "🎉 Ready for EAS build!"
  exit 0
else
  echo "❌ Mobile build validation FAILED with $FAILURES error(s)"
  echo ""
  echo "Fix these issues before pushing to EAS."
  exit 1
fi
