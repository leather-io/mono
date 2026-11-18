import { useOnMount } from '@leather.io/ui';

import { addWalletLockListener } from '@shared/messages';

export function useOnWalletLock(handler: () => void) {
  useOnMount(() => addWalletLockListener(handler));
}
