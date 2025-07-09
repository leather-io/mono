import { useCallback } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import * as Clipboard from 'expo-clipboard';

export function useCopyAddress() {
  const { displayToast } = useToastContext();
  const onCopyAddress = useCallback(
    async function onCopyAddress(address: string) {
      await Clipboard.setStringAsync(address);
      return displayToast({
        type: 'success',
        title: t({
          id: 'receive.select_asset.toast_title',
          message: 'Address copied',
        }),
      });
    },
    [displayToast]
  );
  return onCopyAddress;
}
