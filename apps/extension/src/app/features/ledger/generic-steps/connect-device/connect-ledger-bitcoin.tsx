import { useNavigate } from 'react-router';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { whenPageMode } from '@app/common/utils';
import { handOffLedgerFlowToFullPage } from '@app/features/ledger/flow/ledger-flow-handoff';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest } from '@app/features/ledger/flow/ledger-flow.types';

import { ConnectLedger } from './connect-ledger';

const connectBitcoinKeysRequest: LedgerFlowHandoffRequest = {
  kind: 'request-keys',
  chain: 'bitcoin',
  autoConnect: true,
};

export function ConnectLedgerBitcoin() {
  const navigate = useNavigate();
  const { open } = useLedgerFlow();

  function onConnectBitcoin() {
    return whenPageMode({
      full() {
        open(connectBitcoinKeysRequest);
      },
      popup() {
        void handOffLedgerFlowToFullPage(connectBitcoinKeysRequest, { closeCurrentWindow: true });
      },
    });
  }

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={() => navigate('../')}>
      <ConnectLedger connectBitcoin={onConnectBitcoin()} showInstructions />
    </Sheet>
  );
}
