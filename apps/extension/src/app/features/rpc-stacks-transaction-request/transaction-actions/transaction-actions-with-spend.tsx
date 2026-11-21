import { useMemo } from 'react';

import type { Money } from '@leather.io/models';
import { Approver } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, sumMoney } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { getTransactionActions } from '@app/components/rpc-transaction-request/get-transaction-actions';
import { TransactionActionsTitle } from '@app/components/rpc-transaction-request/transaction-actions-title';
import { TransactionError } from '@app/components/rpc-transaction-request/transaction-error';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';

import { useStacksRpcTransactionRequestContext } from '../stacks/stacks-rpc-transaction-request.context';

interface TransactionActionsWithSpendProps {
  isLoading: boolean;
  isSponsored: boolean;
  txAmount: Money;
  tokenAmountInQuote?: Money;
  onApprove(): Promise<void>;
  approveLabel?: string;
  busyLabel?: string;
}
export function TransactionActionsWithSpend({
  isLoading,
  isSponsored,
  txAmount,
  tokenAmountInQuote,
  onApprove,
  approveLabel,
  busyLabel,
}: TransactionActionsWithSpendProps) {
  const { availableBalance, marketData, selectedFee } = useFeeEditorContext();
  const { status } = useStacksRpcTransactionRequestContext();

  const stxSpend = useMemo(() => {
    const fee = selectedFee?.txFee;
    if (!fee) return txAmount;
    return sumMoney([txAmount, fee]);
  }, [selectedFee?.txFee, txAmount]);

  const totalSpend = useMemo(() => {
    if (!selectedFee?.txFee) return txAmount;
    const stxSpendInQuote = baseCurrencyAmountInQuote(stxSpend, marketData);
    if (!tokenAmountInQuote || tokenAmountInQuote.symbol !== stxSpendInQuote.symbol)
      return stxSpendInQuote;
    return sumMoney([stxSpendInQuote, tokenAmountInQuote]);
  }, [marketData, selectedFee?.txFee, stxSpend, tokenAmountInQuote, txAmount]);

  const isInsufficientBalance = !isSponsored && availableBalance.amount.isLessThan(stxSpend.amount);
  const isBroadcasting = status === 'broadcasting';
  const isSubmitted = status === 'submitted';

  return (
    <Approver.Actions
      actions={getTransactionActions({
        isLoading,
        isBroadcasting,
        isSubmitted,
        isError: isInsufficientBalance,
        onCancel: () => closeWindow(),
        onApprove,
        approveLabel,
        busyLabel,
      })}
    >
      <TransactionActionsTitle isLoading={isLoading} amount={formatCurrency(totalSpend)} />
      <TransactionError isInsufficientBalance={isInsufficientBalance} isLoading={isLoading} />
    </Approver.Actions>
  );
}
