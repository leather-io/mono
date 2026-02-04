import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { isDefined, isNonNullish } from 'remeda';

import {
  type CryptoAssetId,
  type Money,
  type SwapAsset,
  type SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import {
  type AccountRequest,
  type MarketDataService,
  type SwapService,
} from '@leather.io/services';
import { useDebouncedValue } from '@leather.io/ui';
import { delay } from '@leather.io/utils';

import { type DisabledPairRule, type SwapQuotePolicy } from './swap-state.types';
import { createSwapAssetsSelector } from './utils/asset-selection';
import { swapQuoteSelector } from './utils/swap-quote-selection';

const assetsRefetchInterval = 30_000;
const marketDataRefetchInterval = 30_0000;
const globalRefetchOptions = {
  refetchIntervalInBackground: false,
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

interface UseAccountBaseSwapAssetsQueryParams {
  swapService: SwapService;
  accountRequest: AccountRequest;
  disabledPairs?: DisabledPairRule[];
}

export function useAccountBaseSwapAssetsQuery({
  swapService,
  accountRequest,
  disabledPairs,
}: UseAccountBaseSwapAssetsQueryParams) {
  return useQuery({
    queryKey: ['account-base-swap-assets', { request: accountRequest }],
    queryFn: ({ signal }) => swapService.getAccountBaseSwapAssets(accountRequest, signal),
    select: createSwapAssetsSelector('base', { disabledPairs }),
    refetchInterval: assetsRefetchInterval,
    ...globalRefetchOptions,
  });
}

interface UseAccountTargetSwapAssetsQueryParams {
  swapService: SwapService;
  accountRequest: AccountRequest;
  baseId?: CryptoAssetId;
  disabledPairs?: DisabledPairRule[];
}

export function useAccountTargetSwapAssetsQuery({
  swapService,
  accountRequest,
  baseId,
  disabledPairs,
}: UseAccountTargetSwapAssetsQueryParams) {
  return useQuery({
    queryKey: ['account-target-swap-assets', { baseId, request: accountRequest }],
    queryFn: ({ signal }) => {
      if (!baseId) return [];
      return swapService.getAccountTargetSwapAssets(accountRequest, baseId, signal);
    },
    enabled: isDefined(baseId),
    select: createSwapAssetsSelector('target', { disabledPairs, currentBaseId: baseId }),
    refetchInterval: assetsRefetchInterval,
    ...globalRefetchOptions,
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
}

export function useSwapQuotesQuery({
  swapService,
  baseSwapAsset,
  targetSwapAsset,
  baseAmount,
  policy,
  fairMarketRate,
  slippage,
}: UseSwapQuotesQueryParams) {
  const minFetchDuration = 500;
  const debounceDelay = 350;
  const debouncedBaseAmount = useDebouncedValue(baseAmount, debounceDelay);

  return useQuery({
    queryKey: [
      'swap-quotes',
      baseSwapAsset?.asset.symbol,
      targetSwapAsset?.asset.symbol,
      debouncedBaseAmount?.amount.toString(),
    ],
    queryFn: async ({ signal }) => {
      if (!baseSwapAsset || !targetSwapAsset || !debouncedBaseAmount) return [];

      const [quotes] = await Promise.all([
        swapService.getSwapQuotes(baseSwapAsset, targetSwapAsset, debouncedBaseAmount, signal),
        delay(minFetchDuration),
      ]);

      return quotes;
    },
    staleTime: 0,
    select: data => swapQuoteSelector(data, policy, fairMarketRate, slippage),
    enabled: !!(
      baseSwapAsset &&
      targetSwapAsset &&
      isNonNullish(debouncedBaseAmount) &&
      !debouncedBaseAmount.amount.isZero()
    ),
    // Quote refetching should be manually controlled in the usage site instead.
    refetchInterval: false,
    ...globalRefetchOptions,
  });
}

interface UseAssetMarketDataQueryParams {
  marketDataService: MarketDataService;
  asset?: SwappableFungibleCryptoAsset;
}

export function useAssetMarketDataQuery({
  marketDataService,
  asset,
}: UseAssetMarketDataQueryParams) {
  return useQuery({
    queryKey: ['asset-market-data', { asset }],
    queryFn: ({ signal }) => {
      if (!asset) throw new Error('Asset is required');
      return marketDataService.getMarketData(asset, signal);
    },
    enabled: isDefined(asset),
    refetchInterval: marketDataRefetchInterval,
    ...globalRefetchOptions,
  });
}
