import { useRef } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined } from 'remeda';

import { MarketData, Money } from '@leather.io/models';
import { UseIntervalState, useInterval } from '@leather.io/ui/native';
import { assertUnreachable, baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import {
  EnrichedSwapQuote,
  NetworkFee,
  SwapQuoteSelectionResult,
} from '../swap-state/swap-state.types';

const refetchInterval = 30000;

export type LiveSwapEstimate =
  | {
      status: 'idle';
    }
  | {
      status: 'loading';
      refetch(): Promise<void>;
    }
  | {
      status: 'error';
      error: Error;
      refetch(): Promise<void>;
    }
  | {
      status: 'empty';
      refetch(): Promise<void>;
    }
  | {
      status: 'success';
      quotes: EnrichedSwapQuote[];
      selectedQuote: EnrichedSwapQuote;
      fees: {
        provider: { crypto: Money; quote: Money } | undefined;
        network: { crypto: Money; quote: Money };
        isRefetching: boolean;
      };
      isRefetching: boolean;
      refetch(): Promise<void>;
      intervalState: UseIntervalState;
    };

interface UseLiveSwapEstimateProps {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  baseMarketDataQuery: UseQueryResult<MarketData, Error>;
  nativeAssetMarketDataQuery: UseQueryResult<MarketData, Error>;
}

export function useLiveSwapEstimate({
  quoteQuery,
  networkFeeQuery,
  baseMarketDataQuery,
  nativeAssetMarketDataQuery,
}: UseLiveSwapEstimateProps): LiveSwapEstimate {
  const networkFeeReadiness = useNetworkFeeReadiness(
    networkFeeQuery,
    isDefined(quoteQuery.data?.selected)
  );

  const isFetching = quoteQuery.isFetching || networkFeeQuery.isFetching;
  const isPending =
    quoteQuery.isPending ||
    networkFeeReadiness.isLoading ||
    baseMarketDataQuery.isPending ||
    nativeAssetMarketDataQuery.isPending;

  const isError =
    quoteQuery.isError ||
    networkFeeQuery.isError ||
    baseMarketDataQuery.isError ||
    nativeAssetMarketDataQuery.isError;

  const isSuccess =
    quoteQuery.isSuccess &&
    networkFeeReadiness.isReady &&
    baseMarketDataQuery.isSuccess &&
    nativeAssetMarketDataQuery.isSuccess;

  const intervalState = useInterval(refetch, refetchInterval, {
    enabled: isSuccess && isDefined(quoteQuery.data?.selected),
  });

  async function refetch() {
    // Intentionally sequential to avoid race conditions.
    await quoteQuery.refetch();
    await networkFeeQuery.refetch();
  }

  if (isError) {
    return {
      status: 'error',
      error: (quoteQuery.error ??
        networkFeeQuery.error ??
        baseMarketDataQuery.error ??
        nativeAssetMarketDataQuery.error) as Error,
      refetch,
    };
  }

  if (isPending && !isFetching) {
    return { status: 'idle' };
  }

  if (isPending) {
    return { status: 'loading', refetch };
  }

  if (isSuccess) {
    if (!quoteQuery.data.selected) {
      return { status: 'empty', refetch };
    }

    if (!networkFeeQuery.data) {
      return { status: 'loading', refetch };
    }

    const selectedQuote = quoteQuery.data.selected;

    const networkFeeValue = calculateNetworkFee(
      networkFeeQuery.data.calculation.value,
      nativeAssetMarketDataQuery.data
    );

    const providerFee = calculateProviderFee(
      selectedQuote.baseAmount,
      selectedQuote.providerFeePercentage,
      baseMarketDataQuery.data
    );

    return {
      status: 'success',
      selectedQuote,
      quotes: quoteQuery.data.quotes,
      fees: {
        provider: providerFee,
        network: networkFeeValue,
        isRefetching: networkFeeReadiness.isRefetching,
      },
      isRefetching: quoteQuery.isRefetching || networkFeeQuery.isRefetching,
      refetch,
      intervalState,
    };
  }

  return {
    status: 'error',
    error: new Error("Failed to retrieve swap estimate. This is likely a bug in 'useSwapEstimate'"),
    refetch,
  };
}

function useNetworkFeeReadiness(
  networkFeeQuery: UseQueryResult<NetworkFee, Error>,
  hasSelectedQuote: boolean
) {
  const hasResolved = useRef(false);

  if (networkFeeQuery.isSuccess && networkFeeQuery.data) {
    hasResolved.current = true;
  }
  if (!hasSelectedQuote) {
    hasResolved.current = false;
  }

  const hasCached = hasResolved.current && isDefined(networkFeeQuery.data);

  return {
    isReady: networkFeeQuery.isSuccess || hasCached,
    isLoading: networkFeeQuery.isPending && !hasCached,
    isRefetching: hasCached && networkFeeQuery.isFetching,
  };
}

interface LiveEstimateMatchers<T> {
  idle(): T;
  loading(estimate: Extract<LiveSwapEstimate, { status: 'loading' }>): T;
  error(estimate: Extract<LiveSwapEstimate, { status: 'error' }>): T;
  empty(estimate: Extract<LiveSwapEstimate, { status: 'empty' }>): T;
  success(estimate: Extract<LiveSwapEstimate, { status: 'success' }>): T;
}

export function matchLiveEstimate<T>(
  estimate: LiveSwapEstimate,
  matchers: LiveEstimateMatchers<T>
): T {
  const { idle, empty, loading, success, error } = matchers;
  switch (estimate.status) {
    case 'idle':
      return idle();
    case 'loading':
      return loading(estimate);
    case 'error':
      return error(estimate);
    case 'empty':
      return empty(estimate);
    case 'success':
      return success(estimate);
    default:
      return assertUnreachable(estimate);
  }
}

function calculateProviderFee(
  baseAmount: Money,
  providerFeePercentage: BigNumber | undefined,
  marketData: MarketData
): { crypto: Money; quote: Money } | undefined {
  if (providerFeePercentage === undefined) return undefined;

  const crypto = createMoney(
    baseAmount.amount.times(providerFeePercentage),
    baseAmount.symbol,
    baseAmount.decimals
  );
  const quote = baseCurrencyAmountInQuote(crypto, marketData);
  return { crypto, quote };
}

function calculateNetworkFee(
  networkFee: Money,
  marketData: MarketData
): { crypto: Money; quote: Money } {
  return {
    crypto: networkFee,
    quote: baseCurrencyAmountInQuote(networkFee, marketData),
  };
}
