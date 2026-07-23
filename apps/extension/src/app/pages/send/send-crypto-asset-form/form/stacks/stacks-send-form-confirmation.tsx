import { Outlet, useParams } from 'react-router';

import { deserializeTransaction, isTokenTransferPayload } from '@stacks/transactions';
import { Box, Stack } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, convertAmountToBaseUnit, sumMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useLocationStateWithCache } from '@app/common/hooks/use-location-state';
import {
  getNonceFromStacksTransaction,
  getRecipientFromStacksTransaction,
  getSip10MemoDisplayText,
  getSip10TransferAmount,
  getStacksTransactionFee,
  getTokenTransferAmount,
  getTokenTransferMemoDisplayText,
  isNonSequentialMultisigTransaction,
  isSip10TransferContactCall,
} from '@app/common/transactions/stacks/transaction.utils';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useStacksBroadcastTransaction } from '@app/features/stacks-transaction-request/hooks/use-legacy-stacks-broadcast-transaction';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import type { ProposalSentSummaryState } from '../../../sent-summary/proposal-sent-summary';
import { SendFormConfirmationLayout } from '../send-form-confirmation.layout';
import { useProposeStacksSendTransaction } from './use-propose-stacks-send-transaction';

function useStacksSendFormConfirmationState() {
  return {
    tx: useLocationStateWithCache('tx') as string,
    decimals: useLocationStateWithCache('decimals') as number,
    showFeeChangeWarning: useLocationStateWithCache('showFeeChangeWarning') as boolean,
  };
}

export function StacksSendFormConfirmation() {
  const { tx: txHex, decimals, showFeeChangeWarning } = useStacksSendFormConfirmationState();
  const tokenMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');

  const { symbol = 'STX' } = useParams();

  const { stacksBroadcastTransaction, isBroadcasting } = useStacksBroadcastTransaction({
    token: symbol.toUpperCase(),
    redirectToSuccessPage: true,
  });
  const { proposeSendTransaction, isProposing } = useProposeStacksSendTransaction();

  const tx = deserializeTransaction(txHex);
  const isMultisigProposal = isNonSequentialMultisigTransaction(tx);

  const feeWarningTooltip = showFeeChangeWarning ? (
    <BasicTooltip
      label="You are using a nonce for this transaction that is already pending. The fee has been increased so that it is exactly high enough to replace the pending transaction with the same nonce."
      side="bottom"
    >
      <Stack>
        <Box>
          <InfoCircleIcon color="ink.text-subdued" variant="small" />
        </Box>
      </Stack>
    </BasicTooltip>
  ) : null;

  function getProposalSummary(): ProposalSentSummaryState | null {
    const base = {
      symbol: symbol.toUpperCase(),
      recipient: getRecipientFromStacksTransaction(tx) ?? '',
      feeRowValue: formatCurrency(getStacksTransactionFee(tx)),
    };
    if (isTokenTransferPayload(tx.payload)) {
      const amount = getTokenTransferAmount(tx.payload);
      return {
        ...base,
        txValue: convertAmountToBaseUnit(amount).toString(),
        txFiatValue: formatCurrency(baseCurrencyAmountInQuote(amount, tokenMarketData)),
        txFiatValueSymbol: tokenMarketData.price.symbol,
        memoDisplayText: getTokenTransferMemoDisplayText(tx.payload) || 'No memo',
      };
    }
    if (isSip10TransferContactCall(tx)) {
      const amount = getSip10TransferAmount(tx.payload, symbol, decimals);
      return {
        ...base,
        txValue: convertAmountToBaseUnit(amount).toString(),
        memoDisplayText: getSip10MemoDisplayText(tx.payload) ?? 'No memo',
      };
    }
    return null;
  }

  const proposalSummary = getProposalSummary();

  function onConfirmTransaction() {
    if (isMultisigProposal) {
      if (!proposalSummary)
        throw new Error('Unsupported payload for a multisig transaction proposal');
      return proposeSendTransaction(tx, proposalSummary);
    }
    return stacksBroadcastTransaction(tx);
  }

  const sharedProps = {
    symbol: symbol.toUpperCase(),
    onBroadcastTransaction: onConfirmTransaction,
    recipient: getRecipientFromStacksTransaction(tx),
    fee: getStacksTransactionFee(tx),
    nonce: isMultisigProposal ? undefined : getNonceFromStacksTransaction(tx).toString(),
    isLoading: isBroadcasting || isProposing,
    feeWarningTooltip: feeWarningTooltip,
    confirmButtonLabel: isMultisigProposal ? 'Propose transaction' : undefined,
  } as const;

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          <Outlet />
          {isTokenTransferPayload(tx.payload) && (
            <SendFormConfirmationLayout
              txValue={getTokenTransferAmount(tx.payload)}
              txFiatValue={formatCurrency(
                baseCurrencyAmountInQuote(getTokenTransferAmount(tx.payload), tokenMarketData)
              )}
              txFiatValueSymbol={tokenMarketData.price.symbol}
              totalSpend={formatCurrency(
                sumMoney([sharedProps.fee, getTokenTransferAmount(tx.payload)])
              )}
              sendingValue={formatCurrency(getTokenTransferAmount(tx.payload))}
              memoDisplayText={getTokenTransferMemoDisplayText(tx.payload) || 'No memo'}
              {...sharedProps}
            />
          )}
          {isSip10TransferContactCall(tx) && (
            <SendFormConfirmationLayout
              txValue={getSip10TransferAmount(tx.payload, symbol, decimals)}
              totalSpend={[
                formatCurrency(getSip10TransferAmount(tx.payload, symbol, decimals)),
                formatCurrency(sharedProps.fee),
              ].join(' + ')}
              sendingValue={formatCurrency(getSip10TransferAmount(tx.payload, symbol, decimals))}
              memoDisplayText={getSip10MemoDisplayText(tx.payload) ?? 'No memo'}
              {...sharedProps}
            />
          )}
        </Page>
      </Content>
    </>
  );
}
