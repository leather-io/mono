import { Sheet, SheetHeader } from '@leather.io/ui';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';

import { AnimatedOutlet } from '../../components/animated-outlet';
import { LedgerTxSigningContext, LedgerTxSigningProvider } from './ledger-sign-tx.context';

interface TxSigningFlowProps {
  context: LedgerTxSigningContext;
  closeAction?(): void;
}
export function TxSigningFlow({ context, closeAction }: TxSigningFlowProps) {
  useScrollLock(true);
  return (
    <LedgerTxSigningProvider value={context}>
      <Sheet isShowing header={<SheetHeader />} onClose={closeAction}>
        <AnimatedOutlet />
      </Sheet>
    </LedgerTxSigningProvider>
  );
}
