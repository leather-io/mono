import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { PublicKeyMismatchLayout } from './public-key-mismatch.layout';

export function LedgerPublicKeyMismatch() {
  const ledgerSteps = useLedgerSteps();
  return (
    <PublicKeyMismatchLayout
      onClose={() => ledgerSteps.cancelLedgerAction()}
      onTryAgain={() => ledgerSteps.toConnectStepAndTryAgain()}
    />
  );
}
