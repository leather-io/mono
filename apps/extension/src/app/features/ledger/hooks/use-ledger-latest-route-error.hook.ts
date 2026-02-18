import { useSelector } from 'react-redux';

import type { RootState } from '@app/store';

export function useLatestLedgerError() {
  return useSelector((state: RootState) => state.navigation.ledger.latestLedgerError);
}
