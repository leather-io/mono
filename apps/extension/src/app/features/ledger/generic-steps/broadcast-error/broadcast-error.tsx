import { useLocation } from 'react-router';

import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';

import { LedgerBroadcastErrorLayout } from './broadcast-error.layout';

export function LedgerBroadcastError() {
  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  const error = location.state?.error ?? '';

  return (
    <LedgerBroadcastErrorLayout
      error={error}
      onClose={() => ledgerNavigate.cancelLedgerActionAndReturnHome()}
    />
  );
}
