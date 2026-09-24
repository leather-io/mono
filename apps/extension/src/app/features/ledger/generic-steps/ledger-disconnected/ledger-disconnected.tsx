import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { LedgerDisconnectedLayout } from './ledger-disconnected.layout';

export function LedgerDisconnected() {
  const ledgerSteps = useLedgerSteps();
  return (
    <LedgerDisconnectedLayout
      onClose={() => ledgerSteps.cancelLedgerAction()}
      onConnectAgain={() => ledgerSteps.toConnectStepAndTryAgain()}
    />
  );
}
