import { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined } from 'remeda';

import { MarketData, Money, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { UseIntervalState, useInterval } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoneyFromDecimal } from '@leather.io/utils';

import {
  EnrichedSwapQuote,
  NetworkFee,
  SwapQuoteSelectionResult,
} from '../swap-state/swap-state.types';

const refetchInterval = 20000;

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
      networkFee: NetworkFee;
      fees: {
        provider: { crypto: Money; quote: Money } | undefined;
        network: { crypto: Money; quote: Money };
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
  const isFetching = quoteQuery.isFetching || networkFeeQuery.isFetching;
  const isPending =
    quoteQuery.isPending ||
    networkFeeQuery.isPending ||
    baseMarketDataQuery.isPending ||
    nativeAssetMarketDataQuery.isPending;
  const isError =
    quoteQuery.isError ||
    networkFeeQuery.isError ||
    baseMarketDataQuery.isError ||
    nativeAssetMarketDataQuery.isError;
  const isSuccess =
    quoteQuery.isSuccess &&
    networkFeeQuery.isSuccess &&
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

    const selectedQuote = quoteQuery.data.selected;
    const [baseAsset] = selectedQuote.assetPath;

    // TODO: Remove once SwapQuote['baseAmount'] is Money
    if (!baseAsset) {
      return {
        status: 'error',
        error: new Error('Base asset not found in swap quote'),
        refetch,
      };
    }

    const networkFee = calculateNetworkFee(
      networkFeeQuery.data.calculation.value,
      nativeAssetMarketDataQuery.data
    );

    const providerFee = calculateProviderFee(
      selectedQuote.baseAmount,
      selectedQuote.providerFeePercentage,
      baseAsset,
      baseMarketDataQuery.data
    );

    return {
      status: 'success',
      selectedQuote,
      quotes: quoteQuery.data.quotes,
      networkFee: networkFeeQuery.data,
      fees: {
        provider: providerFee,
        network: networkFee,
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

function calculateProviderFee(
  baseAmount: number,
  providerFeePercentage: BigNumber | undefined,
  baseAsset: SwappableFungibleCryptoAsset,
  marketData: MarketData
): { crypto: Money; quote: Money } | undefined {
  if (providerFeePercentage === undefined) return undefined;

  const crypto = createMoneyFromDecimal(
    BigNumber(baseAmount).times(providerFeePercentage),
    baseAsset.symbol,
    baseAsset.decimals
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
