# Version Guard Implementation

This directory contains the implementation of minimum app version enforcement using LaunchDarkly feature flags.

## Overview

The Version Guard system prevents users from using outdated versions of the mobile app that may have critical bugs or security vulnerabilities. It uses LaunchDarkly to remotely configure the minimum required version.

## Architecture

```
LaunchDarkly Flag → useMinimumAppVersion() → useVersionCheck() → VersionGuard → App/UpdateRequired
```

## Components

### Core Utilities
- `version-utils.ts` - Semantic version parsing and comparison
- `store-utils.ts` - Platform-specific app store redirects
- `use-version-check.ts` - Main hook that combines LaunchDarkly data with version logic

### UI Components  
- `VersionGuard` - Main wrapper that conditionally renders app or update screen
- `AppUpdateRequired` - Full-screen update requirement interface
- `UpdateButton` - Platform-specific store redirect button
- `VersionDisplay` - Current vs required version display

### LaunchDarkly Integration
- `useMinimumAppVersion()` hook in `feature-flags/index.ts`
- Flag key: `minimum_app_version`
- String flag (empty string = no enforcement)

## Usage

The VersionGuard is automatically integrated into the app layout (`_layout.tsx`) and will:

1. Check the current app version from `expo-application`
2. Fetch minimum required version from LaunchDarkly
3. Compare versions using semantic versioning
4. Show update screen if current version is outdated
5. Allow normal app flow if version meets requirements

## Testing

### Unit Tests
- `version-utils.spec.ts` - Version comparison logic
- `store-utils.spec.ts` - App store redirect functionality  
- `use-version-check.spec.ts` - Version check hook behavior
- `version-guard.spec.tsx` - Guard component rendering
- Component tests for all UI elements

### E2E Tests
- `maestro/flows/min-version-enforcement.yaml` - End-to-end user flow

### Manual Testing
- Run `scripts/test-version-enforcement.sh` for testing instructions

## LaunchDarkly Configuration

### Flag Setup
- **Key**: `minimum_app_version`
- **Type**: String
- **Default**: `""` (empty string = no enforcement)
- **Example values**: 
  - `""` - No enforcement
  - `"2.58.0"` - Require version 2.58.0 or higher

### Deployment Strategy
1. Create flag with empty default value
2. Test with small user percentage  
3. Gradually increase enforcement coverage
4. Monitor analytics and error rates
5. Emergency disable if issues occur

## Error Handling

The system gracefully handles errors:
- Invalid version formats → Allow app to continue
- LaunchDarkly failures → Allow app to continue  
- Store redirect errors → Show user-friendly message
- Network issues → Default to no enforcement

## Performance

- Version check completes in <100ms
- Results are memoized to prevent unnecessary re-calculations
- Minimal impact on app startup time
- Efficient semantic version comparison algorithm

## Analytics

Track these events for monitoring:
- Version enforcement triggered
- Store redirect success/failure rates
- User version distribution
- Error rates during version checks

## Security Considerations

- Version enforcement is client-side (can be bypassed)
- Consider server-side API version checks for critical security
- Store redirect URLs are verified platform URLs
- No sensitive data in version comparison logic