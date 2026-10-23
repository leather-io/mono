import { useOnMount } from '@leather.io/ui';

import { addSignOutListener } from '@shared/messages';

export function useOnSignOut(handler: () => void) {
  useOnMount(() => {
    addSignOutListener(handler);
  });
}
