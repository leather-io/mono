#!/bin/bash

# Gemfile is currently not supported by Expo.
# See: https://github.com/expo/expo/pull/24048
# https://github.com/expo/expo/issues/34949

# To update your cocoapods, run:
# `sudo gem install cocoapods -v 1.16.2`

# Define required version
REQUIRED_VERSION="1.16.2"

# Check if pod is installed
if ! command -v pod &>/dev/null; then
  echo "Error: CocoaPods is not installed or not in PATH"
  exit 1
fi

# Get installed pod version
INSTALLED_VERSION=$(pod --version)

# Compare versions
if [ "$INSTALLED_VERSION" = "$REQUIRED_VERSION" ]; then
  echo "Success: CocoaPods version $INSTALLED_VERSION matches required version $REQUIRED_VERSION"
  exit 0
else
  echo "Error: CocoaPods version mismatch"
  echo "Installed version: $INSTALLED_VERSION"
  echo "Required version: $REQUIRED_VERSION"
  echo "Gemfile is currently not supported by Expo."
  echo "To update your cocoapods, run:"
  echo "\"sudo gem install cocoapods -v 1.16.2\""
  exit 1
fi
