import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { LedgerDeviceInvalidPayloadLayout } from './device-invalid-payload.layout';

export function LedgerDeviceInvalidPayload() {
  const ledgerSteps = useLedgerSteps();
  return <LedgerDeviceInvalidPayloadLayout onClose={() => ledgerSteps.cancelLedgerAction()} />;
}
