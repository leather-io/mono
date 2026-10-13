import { useEffect } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useVersionCheck } from '@/hooks/use-version-check';
import * as Sentry from '@sentry/react-native';

interface VersionGuardProps {
  onUpdateRequired?(): void;
}

export function VersionGuard({ onUpdateRequired }: VersionGuardProps) {
  const versionCheck = useVersionCheck();
  const { versionGuardSheetRef } = useGlobalSheets();

  useEffect(() => {
    // If there's an error, allow the app to continue (graceful degradation)
    if (versionCheck.error) {
      Sentry.captureException(versionCheck.error, {
        tags: {
          version_guard: 'error',
        },
        level: 'warning',
      });
    }

    if (!versionCheck.isLoading && versionCheck.needsUpdate) {
      versionGuardSheetRef.current?.present();
    }
  }, [versionCheck.error, versionCheck.isLoading, versionCheck.needsUpdate, versionGuardSheetRef]);

  useEffect(() => {
    if (!versionCheck.isLoading && versionCheck.needsUpdate) {
      onUpdateRequired?.();
    }
  }, [versionCheck.isLoading, versionCheck.needsUpdate, onUpdateRequired]);

  return null;
}
