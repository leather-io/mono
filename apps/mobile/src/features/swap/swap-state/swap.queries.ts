import {
  SwapQuotePolicy,
  SwapQuoteSelectionResult,
} from '@/features/swap/swap-state/swap-state.types';
import { createSwapAssetsSelector } from '@/features/swap/swap-state/utils/asset-selection';
import { swapQuoteSelector } from '@/features/swap/swap-state/utils/swap-quote-selection';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined, isNonNullish } from 'remeda';

import {
  CryptoAssetId,
  MarketData,
  Money,
  SwapAsset,
  SwapQuote,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import {
  AccountRequest,
  AccountSwapAsset,
  MarketDataService,
  SwapService,
} from '@leather.io/services';
import { delay } from '@leather.io/utils';

type CustomQueryOptions<TQueryFnData, TError = Error, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryKey' | 'queryFn'
>;

interface UseAccountBaseSwapAssetsQueryParams {
  swapService: SwapService;
  accountRequest: AccountRequest;
  queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
}

export function useAccountBaseSwapAssetsQuery({
  swapService,
  accountRequest,
  queryOptions,
}: UseAccountBaseSwapAssetsQueryParams) {
  return useQuery({
    queryKey: ['account-base-swap-assets', { request: accountRequest }],
    queryFn: ({ signal }) => swapService.getAccountBaseSwapAssets(accountRequest, signal),
    select: createSwapAssetsSelector('base'),
    ...queryOptions,
  });
}

interface UseAccountTargetSwapAssetsQueryParams {
  swapService: SwapService;
  accountRequest: AccountRequest;
  baseId?: CryptoAssetId;
  queryOptions?: CustomQueryOptions<AccountSwapAsset[]>;
}

export function useAccountTargetSwapAssetsQuery({
  swapService,
  accountRequest,
  baseId,
  queryOptions,
}: UseAccountTargetSwapAssetsQueryParams) {
  return useQuery({
    queryKey: ['account-target-swap-assets', { baseId, request: accountRequest }],
    queryFn: ({ signal }) => {
      if (!baseId) return [];
      return swapService.getAccountTargetSwapAssets(accountRequest, baseId, signal);
    },
    enabled: isDefined(baseId),
    select: createSwapAssetsSelector('target'),
    ...queryOptions,
  });
}

interface UseSwapQuotesQueryParams {
  swapService: SwapService;
  baseSwapAsset?: SwapAsset | null;
  targetSwapAsset?: SwapAsset | null;
  baseAmount?: Money | null;
  policy: SwapQuotePolicy;
  fairMarketRate: BigNumber | null;
  slippage: number;
  queryOptions?: CustomQueryOptions<SwapQuote[], Error, SwapQuoteSelectionResult>;
}

export function useSwapQuotesQuery({
  swapService,
  baseSwapAsset,
  targetSwapAsset,
  baseAmount,
  policy,
  fairMarketRate,
  slippage,
  queryOptions,
}: UseSwapQuotesQueryParams) {
  const minFetchDuration = 500;
  const debounceDelay = 350;
  const debouncedBaseAmount = useDebouncedValue(baseAmount, debounceDelay);

  return useQuery({
    queryKey: ['swap-quotes', { baseSwapAsset, targetSwapAsset, debouncedBaseAmount }],
    queryFn: async ({ signal }) => {
      if (!baseSwapAsset || !targetSwapAsset || !debouncedBaseAmount) return [];

      const [quotes] = await Promise.all([
        swapService.getSwapQuotes(
          baseSwapAsset,
          targetSwapAsset,
          debouncedBaseAmount.amount
            .shiftedBy(baseSwapAsset ? -baseSwapAsset.asset.decimals : 0)
            .toNumber(),
          signal
        ),
        delay(minFetchDuration),
      ]);

      return quotes;
    },
    gcTime: 0,
    select: data => swapQuoteSelector(data, policy, fairMarketRate, slippage),
    enabled: !!(
      baseSwapAsset &&
      targetSwapAsset &&
      isNonNullish(debouncedBaseAmount) &&
      !debouncedBaseAmount.amount.isZero()
    ),
    ...queryOptions,
  });
}

interface UseAssetMarketDataQueryParams {
  marketDataService: MarketDataService;
  asset?: SwappableFungibleCryptoAsset;
  queryOptions?: CustomQueryOptions<MarketData>;
}

export function useAssetMarketDataQuery({
  marketDataService,
  asset,
  queryOptions,
}: UseAssetMarketDataQueryParams) {
  return useQuery({
    queryKey: ['asset-market-data', { asset }],
    queryFn: ({ signal }) => {
      if (!asset) throw new Error('Asset is required');
      return marketDataService.getMarketData(asset, signal);
    },
    enabled: isDefined(asset),
    refetchInterval: 30000,
    ...queryOptions,
  });
}
