import { useEffect, useRef } from 'react';

import { clearAppliedUpdateVersion, getAppliedUpdateVersion } from '@shared/extension-update';
import { logger } from '@shared/logger';

import { toastDurations, useToast } from '@app/features/toasts/use-toast';

export function useUpdateAppliedToast(isWalletReady: boolean) {
  const toast = useToast();
  const hasCheckedAppliedUpdate = useRef(false);

  useEffect(() => {
    if (!isWalletReady || hasCheckedAppliedUpdate.current) return;
    hasCheckedAppliedUpdate.current = true;

    async function showAppliedUpdateToast() {
      const appliedVersion = await getAppliedUpdateVersion();
      if (!appliedVersion) return;
      void clearAppliedUpdateVersion();
      if (appliedVersion !== VERSION) return;
      toast.success(`Leather is updated to ${appliedVersion}`, {
        duration: toastDurations.long,
      });
    }

    void showAppliedUpdateToast().catch(e =>
      logger.error('Unable to read the applied extension update version: ', e)
    );
  }, [isWalletReady, toast]);
}
