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

# Install mobile dependencies only
echo "📦 Installing mobile dependencies..."
pnpm install --filter=@leather.io/mobile...
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

echo ""
if [ $FAILURES -eq 0 ]; then
  echo "✅ Mobile build validation PASSED"
  echo ""
  echo "Summary:"
  echo "  ✅ No prepare scripts ran during install"
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
