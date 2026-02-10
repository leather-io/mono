import { useLedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { OutdatedStacksAppWarningBase } from '@app/features/ledger/generic-steps';

export function OutdatedStacksAppWarningTxSigning() {
  const { signTransaction } = useLedgerTxSigningContext();
  return <OutdatedStacksAppWarningBase onTryAgain={signTransaction} />;
}
