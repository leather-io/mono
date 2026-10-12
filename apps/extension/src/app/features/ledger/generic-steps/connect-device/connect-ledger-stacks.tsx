import { useNavigate } from 'react-router';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { whenPageMode } from '@app/common/utils';
import { handOffLedgerFlowToFullPage } from '@app/features/ledger/flow/ledger-flow-handoff';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest } from '@app/features/ledger/flow/ledger-flow.types';

import { ConnectLedger } from './connect-ledger';

const connectStacksKeysRequest: LedgerFlowHandoffRequest = {
  kind: 'request-keys',
  chain: 'stacks',
  autoConnect: true,
};

export function ConnectLedgerStacks() {
  const navigate = useNavigate();
  const { open } = useLedgerFlow();

  function onConnectStacks() {
    return whenPageMode({
      full() {
        open(connectStacksKeysRequest);
      },
      popup() {
        void handOffLedgerFlowToFullPage(connectStacksKeysRequest, { closeCurrentWindow: true });
      },
    });
  }

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={() => navigate('../')}>
      <ConnectLedger connectStacks={onConnectStacks()} showInstructions />
    </Sheet>
  );
}
