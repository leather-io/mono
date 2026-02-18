import { useSelector } from 'react-redux';

import { deserializeTransaction, isTokenTransferPayload } from '@stacks/transactions';
import { Box, Stack } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, sumMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import {
  getNonceFromStacksTransaction,
  getRecipientFromStacksTransaction,
  getSip10MemoDisplayText,
  getSip10TransferAmount,
  getStacksTransactionFee,
  getTokenTransferAmount,
  getTokenTransferMemoDisplayText,
  isSip10TransferContactCall,
} from '@app/common/transactions/stacks/transaction.utils';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useStacksBroadcastTransaction } from '@app/features/stacks-transaction-request/hooks/use-legacy-stacks-broadcast-transaction';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { Outlet, useParams } from '@app/routes/compat';
import type { RootState } from '@app/store';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { SendFormConfirmationLayout } from '../send-form-confirmation.layout';

function useStacksSendFormConfirmationState() {
  const stxConfirmation = useSelector((state: RootState) => state.navigation.send.stxConfirmation);
  return {
    tx: stxConfirmation?.tx ?? '',
    decimals: stxConfirmation?.decimals ?? 0,
    showFeeChangeWarning: stxConfirmation?.showFeeChangeWarning ?? false,
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

  const tx = deserializeTransaction(txHex);

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

  const sharedProps = {
    symbol: symbol.toUpperCase(),
    onBroadcastTransaction: () => stacksBroadcastTransaction(tx),
    recipient: getRecipientFromStacksTransaction(tx),
    fee: getStacksTransactionFee(tx),
    nonce: getNonceFromStacksTransaction(tx).toString(),
    isLoading: isBroadcasting,
    feeWarningTooltip: feeWarningTooltip,
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
