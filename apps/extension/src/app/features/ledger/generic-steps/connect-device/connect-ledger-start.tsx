import type { SupportedBlockchains } from '@leather.io/models';
import { Sheet, SheetHeader } from '@leather.io/ui';

import { doesBrowserSupportWebHidApi, whenPageMode } from '@app/common/utils';
import { handOffLedgerFlowToFullPage } from '@app/features/ledger/flow/ledger-flow-handoff';
import { useLedgerFlow } from '@app/features/ledger/flow/ledger-flow.context';
import type { LedgerFlowHandoffRequest } from '@app/features/ledger/flow/ledger-flow.types';

import { ConnectLedger } from './connect-ledger';

export function ConnectLedgerStart() {
  const { open, close } = useLedgerFlow();

  function connectChain(chain: SupportedBlockchains) {
    const request: LedgerFlowHandoffRequest = doesBrowserSupportWebHidApi()
      ? { kind: 'request-keys', chain, autoConnect: true }
      : { kind: 'unsupported-browser' };

    return whenPageMode({
      full() {
        open(request);
      },
      popup() {
        void handOffLedgerFlowToFullPage(request, { closeCurrentWindow: true });
      },
    })();
  }

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={close}>
      <ConnectLedger
        connectBitcoin={() => connectChain('bitcoin')}
        connectStacks={() => connectChain('stacks')}
        showInstructions
      />
    </Sheet>
  );
}
