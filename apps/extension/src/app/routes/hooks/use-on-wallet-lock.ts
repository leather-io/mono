import { addWalletLockListener } from '@shared/messages';

import { useOnMount } from '@app/common/hooks/use-on-mount';

export function useOnWalletLock(handler: () => void) {
  useOnMount(() => addWalletLockListener(handler));
}
