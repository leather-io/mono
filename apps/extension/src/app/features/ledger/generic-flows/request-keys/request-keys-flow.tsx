import { Sheet, SheetHeader } from '@leather.io/ui';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';

import { AnimatedOutlet } from '../../components/animated-outlet';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { LedgerRequestKeysContext, LedgerRequestKeysProvider } from './ledger-request-keys.context';

interface RequestKeysFlowProps {
  context: LedgerRequestKeysContext;
  isActionCancellableByUser: boolean;
}
export function RequestKeysFlow({ context, isActionCancellableByUser }: RequestKeysFlowProps) {
  const ledgerNavigate = useLedgerNavigate();
  useScrollLock(true);

  const onCancelConnectLedger = ledgerNavigate.cancelLedgerAction;

  return (
    <LedgerRequestKeysProvider value={context}>
      <Sheet
        isShowing
        header={<SheetHeader />}
        onClose={isActionCancellableByUser ? onCancelConnectLedger : undefined}
      >
        <AnimatedOutlet />
      </Sheet>
    </LedgerRequestKeysProvider>
  );
}
