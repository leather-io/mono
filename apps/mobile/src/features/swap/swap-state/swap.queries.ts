import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { isDefined } from 'remeda';

import {
  CryptoAssetId,
  FungibleAssetId,
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

export function createBaseSwapAssetsQuery(service: SwapService) {
  return function useBaseSwapAssetsQuery(params?: {
    queryOptions?: CustomQueryOptions<SwapAsset[]>;
  }) {
    const { queryOptions } = params ?? {};
    return useQuery({
      queryKey: ['base-swap-assets'],
      queryFn: ({ signal }) => service.getBaseSwapAssets(signal),
      ...queryOptions,
    });
  };
}

export function createTargetSwapAssetsQuery(service: SwapService) {
  return function useTargetSwapAssetsQuery(params: {
    baseAssetId: FungibleAssetId;
    queryOptions?: CustomQueryOptions<SwapAsset[]>;
  }) {
    const { baseAssetId, queryOptions } = params;
    return useQuery({
      queryKey: ['target-swap-assets', { baseAssetId }],
      queryFn: ({ signal }) => service.getTargetSwapAssets(baseAssetId, signal),
      ...queryOptions,
    });
  };
}

export function createSwapQuotesQuery(service: SwapService) {
  return function useSwapQuotesQuery(params: {
    baseAsset: SwapAsset;
    targetAsset: SwapAsset;
    baseAmount: number;
    queryOptions?: CustomQueryOptions<SwapQuote[]>;
  }) {
    const { baseAsset, targetAsset, baseAmount, queryOptions } = params;
    return useQuery({
      queryKey: ['swap-quotes', { baseAsset, targetAsset, baseAmount }],
      queryFn: ({ signal }) => service.getSwapQuotes(baseAsset, targetAsset, baseAmount, signal),
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
    asset: FungibleCryptoAsset | null;
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
