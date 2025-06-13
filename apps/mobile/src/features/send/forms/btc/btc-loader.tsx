import { type ReactNode } from 'react';

import { Error } from '@/components/error/error';
import { FetchState, toFetchState } from '@/components/loading/fetch-state';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import BigNumber from 'bignumber.js';

import {
  AccountId,
  AverageBitcoinFeeRates,
  MarketData,
  Money,
  OwnedUtxo,
} from '@leather.io/models';

interface BtcData {
  availableBalance: Money;
  quoteBalance: Money;
  feeRates: AverageBitcoinFeeRates;
  utxos: OwnedUtxo[];
  marketData: MarketData;
}

function useBtcData({ fingerprint, accountIndex }: AccountId): FetchState<BtcData> {
  const feeRates = useAverageBitcoinFeeRates();
  const accountUtxos = useAccountUtxos(fingerprint, accountIndex);
  const btcBalance = useBtcAccountBalance(fingerprint, accountIndex);
  const marketData = useBtcMarketDataQuery();

  const bigZero = new BigNumber(0);
  const zeroFees = {
    fastestFee: bigZero,
    halfHourFee: bigZero,
    hourFee: bigZero,
  };

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
          feeRates: feeRates.data || zeroFees,
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
  const btcDataQuery = useBtcData(account);

  if (btcDataQuery.state === 'loading') {
    return <SendFormLoadingSpinner />;
  }

  if (btcDataQuery.state === 'error') {
    return <Error />;
  }

  return children(btcDataQuery.value);
}
