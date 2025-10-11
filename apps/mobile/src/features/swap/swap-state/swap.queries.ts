import { swapQuoteSelector } from '@/features/swap/swap-state/swap-quote-selector';
import {
  SwapQuoteSelectionResult,
  SwapQuoteStrategy,
} from '@/features/swap/swap-state/swap-state.types';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isDefined, isNonNullish } from 'remeda';

import {
  CryptoAssetId,
  MarketData,
  Money,
  SwapAsset,
  SwapExecutionData,
  SwapQuote,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import {
  AccountRequest,
  AccountSwapAsset,
  MarketDataService,
  SwapService,
} from '@leather.io/services';

type CustomQueryOptions<TQueryFnData, TError = Error, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryKey' | 'queryFn'
>;

export function createAccountBaseSwapAssetsQuery(service: SwapService, request: AccountRequest) {
  return function useAccountBaseSwapAssetsQuery(
    params: {
      queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
    } = {}
  ) {
    const { queryOptions } = params;
    return useQuery({
      queryKey: ['account-base-swap-assets', { request }],
      queryFn: ({ signal }) => service.getAccountBaseSwapAssets(request, signal),
      ...queryOptions,
    });
  };
}

export function createAccountTargetSwapAssetsQuery(service: SwapService, request: AccountRequest) {
  return function useAccountTargetSwapAssetsQuery(params: {
    baseId?: CryptoAssetId;
    queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
  }) {
    const { baseId, queryOptions } = params;
    return useQuery({
      queryKey: ['account-target-swap-assets', { baseId, request }],
      queryFn: ({ signal }) => {
        if (!baseId) return [];
        return service.getAccountTargetSwapAssets(request, baseId, signal);
      },
      enabled: isDefined(baseId),
      ...queryOptions,
    });
  };
}

export function createSwapQuotesQuery(service: SwapService) {
  return function useSwapQuotesQuery(params: {
    baseSwapAsset?: SwapAsset | null;
    targetSwapAsset?: SwapAsset | null;
    baseAmount?: Money | null;
    strategy: SwapQuoteStrategy;
    fairMarketRate: number | null;
    slippage: number;
    queryOptions?: CustomQueryOptions<SwapQuote[], Error, SwapQuoteSelectionResult>;
  }) {
    const {
      baseSwapAsset,
      targetSwapAsset,
      baseAmount,
      strategy,
      fairMarketRate,
      slippage,
      queryOptions,
    } = params;
    const debounceDelay = 350;
    const debouncedBaseAmount = useDebouncedValue(baseAmount, debounceDelay);

    return useQuery({
      queryKey: ['swap-quotes', { baseSwapAsset, targetSwapAsset, debouncedBaseAmount, strategy }],
      queryFn: async ({ signal }) => {
        if (!baseSwapAsset || !targetSwapAsset || !debouncedBaseAmount) return [];

        return service.getSwapQuotes(
          baseSwapAsset,
          targetSwapAsset,
          debouncedBaseAmount.amount
            .shiftedBy(baseSwapAsset ? -baseSwapAsset.asset.decimals : 0)
            .toNumber(),
          signal
        );
      },
      gcTime: 0,
      select: data => swapQuoteSelector(data, strategy, fairMarketRate, slippage),
      enabled: !!(
        baseSwapAsset &&
        targetSwapAsset &&
        isNonNullish(debouncedBaseAmount) &&
        !debouncedBaseAmount.amount.isZero()
      ),
      ...queryOptions,
    });
  };
}

export function createSwapExecutionDataQuery(service: SwapService, request: AccountRequest) {
  return function useSwapExecutionDataQuery(params: {
    quote: SwapQuote;
    slippage: number;
    queryOptions?: CustomQueryOptions<SwapExecutionData>;
  }) {
    const { quote, slippage, queryOptions } = params;
    return useQuery({
      queryKey: ['swap-execution-data', { request, quote, slippage }],
      queryFn: ({ signal }) => service.getSwapExecutionData(request, quote, slippage, signal),
      ...queryOptions,
    });
  };
}

export function createAssetMarketDataQuery(service: MarketDataService) {
  return function useAssetMarketDataQuery(params: {
    asset?: SwappableFungibleCryptoAsset;
    queryOptions?: CustomQueryOptions<MarketData>;
  }) {
    const { asset, queryOptions } = params;
    return useQuery({
      queryKey: ['asset-market-data', { asset }],
      queryFn: ({ signal }) => {
        if (!asset) throw new Error('Asset is required');
        return service.getMarketData(asset, signal);
      },
      enabled: isDefined(asset),
      refetchInterval: 30000, // Refetch every 30 seconds
      ...queryOptions,
    });
  };
}
