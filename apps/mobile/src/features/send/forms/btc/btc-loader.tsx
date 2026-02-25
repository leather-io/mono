import { type ReactNode } from 'react';

import { Error } from '@/components/error/error';
import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { useBitcoinTransactionFees } from '@/queries/fees/bitcoin-transaction-fees.hooks';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { useQueryClient } from '@tanstack/react-query';

import { AccountId, MarketData, Money, OwnedUtxo, TransactionFees } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

interface BtcData {
  availableBalance: Money;
  quoteBalance: Money;
  feeRates: TransactionFees;
  utxos: OwnedUtxo[];
  marketData: MarketData;
}

function useBtcData(account: AccountId): FetchState<BtcData> {
  const { fingerprint, accountIndex } = account;
  const accountRequest = useAccountRequest();
  const accountUtxos = useAccountUtxos(fingerprint, accountIndex);
  const btcBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const marketData = useBtcMarketDataQuery();

  const availableBalance = btcBalance.value?.btc.availableBalance ?? createMoney(0, 'BTC');
  const recipient = '';
  const txFeesQuery = useBitcoinTransactionFees({
    account: accountRequest,
    recipients: [{ address: recipient, amount: availableBalance }],
    enabled: !!btcBalance.value,
  });

  const isReady = btcBalance.value && accountUtxos.value && txFeesQuery.data && marketData.data;
  const isLoading =
    txFeesQuery.status === 'pending' ||
    accountUtxos.state === 'loading' ||
    btcBalance.state === 'loading' ||
    marketData.status === 'pending';
  const isError =
    txFeesQuery.status === 'error' ||
    accountUtxos.state === 'error' ||
    btcBalance.state === 'error' ||
    marketData.status == 'error';

  return toFetchState({
    data: isReady
      ? {
          availableBalance: btcBalance.value?.btc.availableBalance,
          quoteBalance: btcBalance.value?.quote.availableBalance,
          feeRates: txFeesQuery.data,
          utxos: accountUtxos.value?.available,
          marketData: marketData.data,
        }
      : null,
    isLoading: isLoading,
    isError: isError,
    error: null,
  });
}

interface BtcDataLoaderProps {
  account: AccountId;
  children(data: BtcData): ReactNode;
}

export function BtcDataLoader({ account, children }: BtcDataLoaderProps) {
  const queryClient = useQueryClient();
  const btcDataQuery = useBtcData(account);

  if (btcDataQuery.state === 'loading') {
    return <SendFormLoadingSpinner />;
  }

  if (btcDataQuery.state === 'error') {
    return <Error onRetry={() => queryClient.refetchQueries()} />;
  }

  return children(btcDataQuery.value);
}
