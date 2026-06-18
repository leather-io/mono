import { addWalletListChangedListener } from '@shared/messages';

import { useOnMount } from '@app/common/hooks/use-on-mount';

export function useOnWalletListChanged(
  handler: (payload: { removedFingerprint?: string }) => void
) {
  useOnMount(() => addWalletListChangedListener(handler));
}
