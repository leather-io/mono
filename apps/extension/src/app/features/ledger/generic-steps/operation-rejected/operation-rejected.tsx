import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';

import { LedgerOperationRejectedLayout } from './operation-rejected.layout';

const defaultOperationRejectedDescription = 'The operation on device was rejected';

interface OperationRejectedProps {
  description?: string;
}
export function OperationRejected({ description }: OperationRejectedProps) {
  const ledgerSteps = useLedgerSteps();
  return (
    <LedgerOperationRejectedLayout
      description={description ?? defaultOperationRejectedDescription}
      onClose={() => ledgerSteps.cancelLedgerAction()}
    />
  );
}
