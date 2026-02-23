import { useMemo } from 'react';

import { useMinimumAppVersion } from '@/features/feature-flags';
import { isValidVersion, isVersionLessThan } from '@/utils/version-utils';
import { t } from '@lingui/core/macro';
import * as Application from 'expo-application';

interface VersionCheckResult {
  needsUpdate: boolean;
  currentVersion: string;
  minimumVersion: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that checks if the current app version meets the minimum required version
 * from LaunchDarkly feature flags
 */
export function useVersionCheck(): VersionCheckResult {
  const minimumVersionFromFlag = useMinimumAppVersion();
  const currentVersion = Application.nativeApplicationVersion || '';

  return useMemo(() => {
    try {
      // If no current version available, we can't determine if update is needed
      if (!currentVersion) {
        return {
          needsUpdate: false,
          currentVersion: '',
          minimumVersion: null,
          isLoading: false,
          error: t`Unable to determine current app version`,
        };
      }

      // If current version format is invalid, don't enforce update
      if (!isValidVersion(currentVersion)) {
        return {
          needsUpdate: false,
          currentVersion,
          minimumVersion: null,
          isLoading: false,
          error: t`Current app version format is invalid`,
        };
      }

      // If no minimum version is set (empty string or null), no enforcement
      if (!minimumVersionFromFlag || minimumVersionFromFlag.trim() === '') {
        return {
          needsUpdate: false,
          currentVersion,
          minimumVersion: null,
          isLoading: false,
          error: null,
        };
      }

      const minimumVersion = minimumVersionFromFlag.trim();

      // If minimum version format is invalid, don't enforce update
      if (!isValidVersion(minimumVersion)) {
        return {
          needsUpdate: false,
          currentVersion,
          minimumVersion,
          isLoading: false,
          error: t`Minimum version format is invalid`,
        };
      }

      // Check if current version is less than minimum required
      const needsUpdate = isVersionLessThan(currentVersion, minimumVersion);

      return {
        needsUpdate,
        currentVersion,
        minimumVersion,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      // If any error occurs, default to no enforcement
      return {
        needsUpdate: false,
        currentVersion,
        minimumVersion: minimumVersionFromFlag || null,
        isLoading: false,
        error: error instanceof Error ? error.message : t`Unknown error during version check`,
      };
    }
  }, [currentVersion, minimumVersionFromFlag]);
}
