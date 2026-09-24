import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { LedgerBroadcastErrorLayout } from './broadcast-error.layout';

interface LedgerBroadcastErrorProps {
  error: string;
}
export function LedgerBroadcastError({ error }: LedgerBroadcastErrorProps) {
  const ledgerSteps = useLedgerSteps();

  return (
    <LedgerBroadcastErrorLayout
      error={error}
      onClose={() => ledgerSteps.cancelLedgerActionAndReturnHome()}
    />
  );
}
