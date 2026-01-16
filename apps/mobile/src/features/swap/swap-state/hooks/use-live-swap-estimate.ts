import { useRef } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined } from 'remeda';

import { ExecutionConstraint, MarketData, Money } from '@leather.io/models';
import { UseIntervalState, useInterval } from '@leather.io/ui/native';
import { assertUnreachable, baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { EnrichedSwapQuote, NetworkFee, SwapQuoteSelectionResult } from '../swap-state.types';

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
      status: 'constrained';
      constraints: ExecutionConstraint[];
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
  const intervalState = useInterval(refetch, refetchInterval, {
    enabled: networkFeeReadiness.status === 'ready' && isDefined(quoteQuery.data?.selected),
  });

  async function refetch() {
    await quoteQuery.refetch();
    await networkFeeQuery.refetch();
  }

  // Live estimate status is verified in two stages:
  // 1. Check the status of the quote itself in isolation, handle cases with which the remaining queries are irrelevant.
  // 2. Check the status of the network fee query and supporting market data queries before alloweing to proceed to success state.

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage 1: Quote Query
  // ═══════════════════════════════════════════════════════════════════════════

  if (quoteQuery.isPending && !quoteQuery.isFetching) {
    return { status: 'idle' };
  }

  if (quoteQuery.isError) {
    return { status: 'error', error: quoteQuery.error, refetch };
  }

  if (quoteQuery.isPending) {
    return { status: 'loading', refetch };
  }

  if (!quoteQuery.data.selected) {
    const { unmetConstraints } = quoteQuery.data;
    if (unmetConstraints.length > 0) {
      return { status: 'constrained', constraints: unmetConstraints, refetch };
    }
    return { status: 'empty', refetch };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Stage 2: Network Fee + Market Data
  // ═══════════════════════════════════════════════════════════════════════════

  if (networkFeeReadiness.status === 'error') {
    return { status: 'error', error: networkFeeReadiness.error, refetch };
  }
  if (baseMarketDataQuery.isError) {
    return { status: 'error', error: baseMarketDataQuery.error, refetch };
  }
  if (nativeAssetMarketDataQuery.isError) {
    return { status: 'error', error: nativeAssetMarketDataQuery.error, refetch };
  }

  if (
    networkFeeReadiness.status === 'loading' ||
    baseMarketDataQuery.isPending ||
    nativeAssetMarketDataQuery.isPending
  ) {
    return { status: 'loading', refetch };
  }

  const networkFeeValue = calculateNetworkFee(
    networkFeeReadiness.data.calculation.value,
    nativeAssetMarketDataQuery.data
  );

  const providerFee = calculateProviderFee(
    quoteQuery.data.selected.baseAmount,
    quoteQuery.data.selected.providerFeePercentage,
    baseMarketDataQuery.data
  );

  return {
    status: 'success',
    selectedQuote: quoteQuery.data.selected,
    quotes: quoteQuery.data.quotes,
    fees: {
      provider: providerFee,
      network: networkFeeValue,
      isRefetching: networkFeeReadiness.isRefetching,
    },
    isRefetching: quoteQuery.isRefetching || networkFeeReadiness.isRefetching,
    refetch,
    intervalState,
  };
}

type NetworkFeeReadiness =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: NetworkFee; isRefetching: boolean };

function useNetworkFeeReadiness(
  networkFeeQuery: UseQueryResult<NetworkFee, Error>,
  isEnabled: boolean
): NetworkFeeReadiness {
  const hasResolved = useRef(false);

  if (networkFeeQuery.isSuccess && networkFeeQuery.data) {
    hasResolved.current = true;
  }
  if (!isEnabled) {
    hasResolved.current = false;
  }

  if (networkFeeQuery.isError && networkFeeQuery.error) {
    return { status: 'error', error: networkFeeQuery.error };
  }

  const hasCached = hasResolved.current && isDefined(networkFeeQuery.data);

  if (networkFeeQuery.data && (networkFeeQuery.isSuccess || hasCached)) {
    return {
      status: 'ready',
      data: networkFeeQuery.data,
      isRefetching: hasCached && networkFeeQuery.isFetching,
    };
  }

  return { status: 'loading' };
}

interface LiveEstimateMatchers<T> {
  idle(): T;
  loading(estimate: Extract<LiveSwapEstimate, { status: 'loading' }>): T;
  error(estimate: Extract<LiveSwapEstimate, { status: 'error' }>): T;
  empty(estimate: Extract<LiveSwapEstimate, { status: 'empty' }>): T;
  constrained(estimate: Extract<LiveSwapEstimate, { status: 'constrained' }>): T;
  success(estimate: Extract<LiveSwapEstimate, { status: 'success' }>): T;
}

export function matchLiveEstimate<T>(
  estimate: LiveSwapEstimate,
  matchers: LiveEstimateMatchers<T>
): T {
  const { idle, empty, loading, success, error, constrained } = matchers;
  switch (estimate.status) {
    case 'idle':
      return idle();
    case 'loading':
      return loading(estimate);
    case 'error':
      return error(estimate);
    case 'empty':
      return empty(estimate);
    case 'constrained':
      return constrained(estimate);
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
