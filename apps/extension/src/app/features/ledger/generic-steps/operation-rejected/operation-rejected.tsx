import { useSelector } from 'react-redux';

import { LedgerOperationRejectedLayout } from '@app/features/ledger/generic-steps/operation-rejected/operation-rejected.layout';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import type { RootState } from '@app/store';

export function OperationRejected() {
  const ledgerNavigate = useLedgerNavigate();
  const description = useSelector((state: RootState) => state.navigation.ledger.description);
  return (
    <LedgerOperationRejectedLayout
      description={description ?? 'The operation on device was rejected'}
      onClose={() => ledgerNavigate.cancelLedgerAction()}
    />
  );
}
