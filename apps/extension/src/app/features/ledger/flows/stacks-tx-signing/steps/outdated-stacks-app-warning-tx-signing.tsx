import { useLedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps/outdated-stacks-app-warning/outdated-stacks-app-warning-base';

export function OutdatedStacksAppWarningTxSigning() {
  const { signTransaction, onCancelTxSigning } = useLedgerTxSigningContext();
  return <OutdatedStacksAppWarningBase onTryAgain={signTransaction} onCancel={onCancelTxSigning} />;
}
