import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import {
  CryptoAssetId,
  FungibleCryptoAsset,
  MarketData,
  SwapAsset,
  SwapExecutionData,
  SwapQuote,
} from '@leather.io/models';
import {
  AccountRequest,
  AccountSwapAsset,
  MarketDataService,
  SwapService,
} from '@leather.io/services';

type CustomQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

export function createAccountBaseSwapAssetsQuery(service: SwapService, request: AccountRequest) {
  return function useAccountBaseSwapAssetsQuery(params: {
    queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
  }) {
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
    baseAmount: number;
    queryOptions?: CustomQueryOptions<SwapQuote[]>;
  }) {
    const { baseSwapAsset, targetSwapAsset, baseAmount, queryOptions } = params;
    const debouncedBaseAmount = useDebouncedValue(baseAmount, 200);

    return useQuery({
      queryKey: ['swap-quotes', { baseSwapAsset, targetSwapAsset, debouncedBaseAmount }],
      queryFn: ({ signal }) => {
        if (!baseSwapAsset || !targetSwapAsset) return [];
        return service.getSwapQuotes(baseSwapAsset, targetSwapAsset, debouncedBaseAmount, signal);
      },
      enabled: !!(baseSwapAsset && targetSwapAsset && debouncedBaseAmount > 0),
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
    asset?: FungibleCryptoAsset;
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
