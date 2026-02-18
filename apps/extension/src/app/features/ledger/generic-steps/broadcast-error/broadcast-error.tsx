import { useSelector } from 'react-redux';

import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import type { RootState } from '@app/store';

import { LedgerBroadcastErrorLayout } from './broadcast-error.layout';

export function LedgerBroadcastError() {
  const ledgerNavigate = useLedgerNavigate();
  const error = useSelector((state: RootState) => state.navigation.ledger.error);

  return (
    <LedgerBroadcastErrorLayout
      error={error ?? ''}
      onClose={() => ledgerNavigate.cancelLedgerActionAndReturnHome()}
    />
  );
}
