#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/update-pnpm-version.sh <version>"
  echo "Example: ./scripts/update-pnpm-version.sh 10.26.0"
  echo ""
  echo "This script will:"
  echo "  1. Run 'corepack use pnpm@<version>' to update package.json"
  echo "  2. Extract the SHA from package.json"
  echo "  3. Update .prototools"
  echo "  4. Update .github/actions/provision/action.yml"
  exit 1
fi

VERSION=$1

echo "Updating pnpm to version $VERSION..."

echo "Step 1: Running corepack use pnpm@$VERSION..."
corepack use pnpm@$VERSION

PACKAGE_MANAGER=$(grep '"packageManager"' package.json | sed 's/.*"packageManager": "\([^"]*\)".*/\1/')
echo "Extracted packageManager: $PACKAGE_MANAGER"

echo "Step 2: Updating .prototools..."
sed -i '' "s/^pnpm = \".*\"/pnpm = \"$VERSION\"/" .prototools

echo "Step 3: Updating .github/actions/provision/action.yml..."
VERSION_WITH_SHA=$(echo "$PACKAGE_MANAGER" | sed 's/pnpm@//')
sed -i '' "s/version: '.*'/version: '$VERSION_WITH_SHA'/" .github/actions/provision/action.yml

echo ""
echo "Done! Updated pnpm version to $VERSION in:"
echo "  - package.json (packageManager)"
echo "  - .prototools"
echo "  - .github/actions/provision/action.yml"
echo ""
echo "Please verify the changes with: git diff"
