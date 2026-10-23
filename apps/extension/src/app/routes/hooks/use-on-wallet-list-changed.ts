import { useOnMount } from '@leather.io/ui';

import { addWalletListChangedListener } from '@shared/messages';

export function useOnWalletListChanged(
  handler: (payload: { removedFingerprint?: string }) => void
) {
  useOnMount(() => addWalletListChangedListener(handler));
}
