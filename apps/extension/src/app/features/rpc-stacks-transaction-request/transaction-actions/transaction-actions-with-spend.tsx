import { useMemo } from 'react';

import type { Money } from '@leather.io/models';
import { Approver } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, sumMoney } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useWalletType } from '@app/common/use-wallet-type';
import { FormError } from '@app/components/form-error';
import { getTransactionActions } from '@app/components/rpc-transaction-request/get-transaction-actions';
import { TransactionActionsTitle } from '@app/components/rpc-transaction-request/transaction-actions-title';
import { TransactionError } from '@app/components/rpc-transaction-request/transaction-error';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { ledgerMultisigProposalsUnsupportedMessage } from '@app/features/multisig/multisig-ledger.constants';

import { useRpcTransactionRequest } from '../use-rpc-transaction-request';

interface TransactionActionsWithSpendProps {
  isLoading: boolean;
  isSponsored: boolean;
  txAmount: Money;
  onApprove(): Promise<void>;
  approveLabel?: string;
  busyLabel?: string;
  isProposeFlow?: boolean;
  approvalError?: string;
}
export function TransactionActionsWithSpend({
  isLoading,
  isSponsored,
  txAmount,
  onApprove,
  approveLabel,
  busyLabel,
  isProposeFlow,
  approvalError,
}: TransactionActionsWithSpendProps) {
  const { availableBalance, marketData, selectedFee } = useFeeEditorContext();
  const { status } = useRpcTransactionRequest();
  const { walletType } = useWalletType();

  const isProposeUnsupportedOnLedger = Boolean(isProposeFlow) && walletType === 'ledger';
  const hasApprovalError = Boolean(approvalError);

  const totalSpend = useMemo(() => {
    const fee = selectedFee?.txFee;
    if (!fee) return txAmount;
    return baseCurrencyAmountInQuote(sumMoney([txAmount, fee]), marketData);
  }, [marketData, selectedFee?.txFee, txAmount]);

  // TODO LEA-2537: Refactor error state
  const isInsufficientBalance =
    !isSponsored && availableBalance.amount.isLessThan(totalSpend.amount);

  return (
    <Approver.Actions
      actions={getTransactionActions({
        isLoading,
        isBroadcasting: status === 'broadcasting',
        isSubmitted: status === 'submitted',
        isError: isInsufficientBalance,
        isApproveDisabled: isProposeUnsupportedOnLedger || hasApprovalError,
        onCancel: () => closeWindow(),
        onApprove,
        approveLabel,
        busyLabel,
      })}
    >
      <TransactionActionsTitle isLoading={isLoading} amount={formatCurrency(totalSpend)} />
      <TransactionError isInsufficientBalance={isInsufficientBalance} isLoading={isLoading} />
      {!isLoading && approvalError && <FormError text={approvalError} />}
      {isProposeUnsupportedOnLedger && (
        <FormError text={ledgerMultisigProposalsUnsupportedMessage} />
      )}
    </Approver.Actions>
  );
}
