import { Sheet, SheetHeader } from '@leather.io/ui';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';

import { AnimatedOutlet } from '../../components/animated-outlet';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { LedgerRequestKeysContext, LedgerRequestKeysProvider } from './ledger-request-keys.context';

interface RequestKeysFlowProps {
  context: LedgerRequestKeysContext;
  isActionCancellableByUser: boolean;
  onCancelAction?(): void;
}
export function RequestKeysFlow({
  context,
  isActionCancellableByUser,
  onCancelAction,
}: RequestKeysFlowProps) {
  const ledgerNavigate = useLedgerNavigate();
  useScrollLock(true);

  function onCancelConnectLedger() {
    onCancelAction?.();
    void ledgerNavigate.cancelLedgerAction();
  }

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
