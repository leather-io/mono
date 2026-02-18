import { useSelector } from 'react-redux';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import type { RootState } from '@app/store';

export function useWhenReattemptingLedgerConnection(fn: () => void) {
  const immediatelyAttemptConnection = useSelector(
    (state: RootState) => state.navigation.ledger.immediatelyAttemptConnection
  );

  useOnMount(() => {
    if (immediatelyAttemptConnection) {
      // hack to call function on mount
      setTimeout(fn);
    }
  });
}
