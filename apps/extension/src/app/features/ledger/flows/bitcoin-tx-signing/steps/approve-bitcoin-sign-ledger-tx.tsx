import { getBitcoinInputValue, getPsbtTxInputs, getPsbtTxOutputs } from '@leather.io/bitcoin';

import { useLedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { ApproveLedgerOperationLayout } from '@app/features/ledger/generic-steps/approve-ledger-operation/approve-ledger-operation.layout';
import { useHasApprovedOperation } from '@app/features/ledger/hooks/use-has-approved-transaction';

export function ApproveSignLedgerBitcoinTx() {
  const hasApprovedOperation = useHasApprovedOperation();

  const context = useLedgerTxSigningContext();

  if (context.chain !== 'bitcoin' || !context.transaction) return null;

  const details: [string, string][] = [
    ...getPsbtTxInputs(context.transaction).map((input, i): [string, string] => [
      `Input ${i + 1}`,
      `${getBitcoinInputValue(input)} sats`,
    ]),
    ...getPsbtTxOutputs(context.transaction).map((output, i): [string, string] => [
      `Output ${i + 1}`,
      output.amount?.toString() + ' sats',
    ]),
  ];

  return (
    <ApproveLedgerOperationLayout
      description="Verify the transaction details on your Ledger"
      details={details}
      status={hasApprovedOperation ? 'approved' : 'awaiting-approval'}
    />
  );
}
