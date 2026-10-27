import { useParams } from 'react-router';

import { deserializeTransaction, isTokenTransferPayload } from '@stacks/transactions';
import { Box, Stack } from 'leather-styles/jsx';

import { getSbtcSponsoredTransferDetails } from '@leather.io/stacks';
import { InfoCircleIcon } from '@leather.io/ui';
import {
  baseCurrencyAmountInQuote,
  convertAmountToBaseUnit,
  isDefined,
  sumMoney,
} from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useRouteState } from '@app/common/hooks/use-route-state';
import {
  getNonceFromStacksTransaction,
  getRecipientFromStacksTransaction,
  getSip10MemoDisplayText,
  getSip10TransferAmount,
  getSip10TransferPayload,
  getStacksTransactionFee,
  getTokenTransferAmount,
  getTokenTransferMemoDisplayText,
  isNonSequentialMultisigTransaction,
} from '@app/common/transactions/stacks/transaction.utils';
import { useStacksBroadcastTransaction } from '@app/common/transactions/stacks/use-stacks-broadcast-transaction';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import type { ProposalSentSummaryState } from '../../../sent-summary/proposal-sent-summary';
import { stacksConfirmationRouteStateSchema } from '../../hooks/use-send-form-navigate';
import { SendFormConfirmationLayout } from '../send-form-confirmation.layout';
import { SbtcSponsoredSendFormConfirmation } from './sbtc-sponsored-send-form-confirmation';
import { useProposeStacksSendTransaction } from './use-propose-stacks-send-transaction';

export function StacksSendFormConfirmation() {
  const {
    tx: txHex,
    decimals,
    showFeeChangeWarning = false,
    sponsorship,
    showRequoteCallout = false,
  } = useRouteState(stacksConfirmationRouteStateSchema);
  const tokenMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');

  const { symbol = 'STX' } = useParams();

  const { stacksBroadcastTransaction, isBroadcasting } = useStacksBroadcastTransaction({
    token: symbol.toUpperCase(),
    redirectToSuccessPage: true,
  });
  const { proposeSendTransaction, isProposing } = useProposeStacksSendTransaction();

  const tx = deserializeTransaction(txHex);
  const sip10Payload = getSip10TransferPayload(tx);
  const isMultisigProposal = isNonSequentialMultisigTransaction(tx);
  const sponsoredDetails = getSbtcSponsoredTransferDetails(tx);

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
    if (sip10Payload) {
      const amount = getSip10TransferAmount(sip10Payload, symbol, decimals);
      return {
        ...base,
        txValue: convertAmountToBaseUnit(amount).toString(),
        memoDisplayText: getSip10MemoDisplayText(sip10Payload) ?? 'No memo',
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
    feeWarningTooltip,
    confirmButtonLabel: isMultisigProposal ? 'Propose transaction' : undefined,
  } as const;

  return (
    <>
      <PageHeader title="Review" />
      <Content>
        <Page>
          {sponsorship && sponsoredDetails && isDefined(decimals) && (
            <SbtcSponsoredSendFormConfirmation
              tx={tx}
              details={sponsoredDetails}
              sponsorship={sponsorship}
              symbol={symbol}
              decimals={decimals}
              showRequoteCallout={showRequoteCallout}
            />
          )}
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
          {sip10Payload && (
            <SendFormConfirmationLayout
              txValue={getSip10TransferAmount(sip10Payload, symbol, decimals)}
              totalSpend={[
                formatCurrency(getSip10TransferAmount(sip10Payload, symbol, decimals)),
                formatCurrency(sharedProps.fee),
              ].join(' + ')}
              sendingValue={formatCurrency(getSip10TransferAmount(sip10Payload, symbol, decimals))}
              memoDisplayText={getSip10MemoDisplayText(sip10Payload) ?? 'No memo'}
              {...sharedProps}
            />
          )}
        </Page>
      </Content>
    </>
  );
}
