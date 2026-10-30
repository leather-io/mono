import { type ReactNode } from 'react';

import { Error } from '@/components/error/error';
import { type FetchState, toFetchState } from '@/components/loading/fetch-state';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { type BitcoinFeeRates, useBitcoinFeeRates } from '@/queries/fees/bitcoin-fee-rates.query';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { useQueryClient } from '@tanstack/react-query';

import { type AccountId, type MarketData, type Money, type OwnedUtxo } from '@leather.io/models';

interface BtcData {
  availableBalance: Money;
  quoteBalance: Money;
  feeRates: BitcoinFeeRates;
  utxos: OwnedUtxo[];
  marketData: MarketData;
}

const zeroFeeRates: BitcoinFeeRates = {
  low: { rate: 0 },
  standard: { rate: 0 },
  high: { rate: 0 },
};

function useBtcData(account: AccountId): FetchState<BtcData> {
  const feeRates = useBitcoinFeeRates();
  const { fingerprint, accountIndex } = account;
  const accountUtxos = useAccountUtxos(fingerprint, accountIndex);
  const btcBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const marketData = useBtcMarketDataQuery();

  // TODO: Replace with aggregate queries once we have more flexible query API
  const isReady = btcBalance.value && accountUtxos.value && feeRates.data && marketData.data;
  const isLoading =
    feeRates.status === 'pending' ||
    accountUtxos.state === 'loading' ||
    btcBalance.state === 'loading' ||
    marketData.status === 'pending';
  const isError =
    feeRates.status === 'error' ||
    accountUtxos.state === 'error' ||
    btcBalance.state === 'error' ||
    marketData.status == 'error';

  return toFetchState({
    data: isReady
      ? {
          availableBalance: btcBalance.value?.btc.availableBalance,
          quoteBalance: btcBalance.value?.quote.availableBalance,
          feeRates: feeRates.data ?? zeroFeeRates,
          utxos: accountUtxos.value?.available,
          marketData: marketData.data,
        }
      : null,
    isLoading,
    isError,
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
    return <Error onRetry={() => void queryClient.refetchQueries()} />;
  }

  return children(btcDataQuery.value);
}
