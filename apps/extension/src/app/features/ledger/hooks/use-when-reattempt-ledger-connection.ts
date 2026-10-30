import { useOnMount } from '@leather.io/ui';

import { useLedgerStep } from '../flow/ledger-flow.context';

export function useWhenReattemptingLedgerConnection(fn: () => void) {
  const step = useLedgerStep();

  useOnMount(() => {
    if (step.name !== 'connect' || !step.retryImmediately) return;
    // hack to call function on mount
    setTimeout(fn);
  });
}
