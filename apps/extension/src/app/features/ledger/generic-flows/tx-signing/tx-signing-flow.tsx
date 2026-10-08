import { LedgerFlowSheet, type LedgerStepOverrides } from '../../flow/ledger-flow-sheet';
import { OutdatedStacksAppWarningTxSigning } from '../../flows/stacks-tx-signing/steps/outdated-stacks-app-warning-tx-signing';
import { LedgerTxSigningContext, LedgerTxSigningProvider } from './ledger-sign-tx.context';
import { ConnectLedgerSignTx } from './steps/connect-ledger-sign-tx';

interface TxSigningFlowProps {
  context: LedgerTxSigningContext;
  closeAction?(): void;
  renderStep?: LedgerStepOverrides;
}
export function TxSigningFlow({ context, closeAction, renderStep }: TxSigningFlowProps) {
  return (
    <LedgerTxSigningProvider value={context}>
      <LedgerFlowSheet
        onClose={closeAction}
        renderStep={{
          connect: <ConnectLedgerSignTx />,
          'outdated-stacks-app': <OutdatedStacksAppWarningTxSigning />,
          ...renderStep,
        }}
      />
    </LedgerTxSigningProvider>
  );
}
