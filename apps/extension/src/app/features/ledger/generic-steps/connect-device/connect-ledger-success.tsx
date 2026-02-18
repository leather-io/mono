import { useSelector } from 'react-redux';

import type { RootState } from '@app/store';

import { ConnectLedgerSuccessLayout } from './connect-ledger-success.layout';

export function ConnectLedgerSuccess() {
  const chain = useSelector((state: RootState) => state.navigation.ledger.chain);
  if (!chain) return null;
  return <ConnectLedgerSuccessLayout chain={chain} />;
}
