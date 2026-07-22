import { addSignOutListener } from '@shared/messages';

import { useOnMount } from '@app/common/hooks/use-on-mount';

export function useOnSignOut(handler: () => void) {
  useOnMount(() => {
    addSignOutListener(handler);
  });
}
