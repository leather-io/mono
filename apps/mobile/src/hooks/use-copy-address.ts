import { useCallback } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/core/macro';
import * as Clipboard from 'expo-clipboard';

export function useCopyAddress() {
  const { displayToast } = useToastContext();
  const onCopyAddress = useCallback(
    async function onCopyAddress(address: string) {
      await Clipboard.setStringAsync(address);
      return displayToast({
        type: 'success',
        title: t`Address copied`,
      });
    },
    [displayToast]
  );
  return onCopyAddress;
}
