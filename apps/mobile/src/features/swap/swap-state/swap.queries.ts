import {
  SwapQuoteSelectionResult,
  SwapQuoteStrategy,
} from '@/features/swap/swap-state/swap-state.types';
import { createSwapAssetsSelector } from '@/features/swap/swap-state/utils/asset-selection';
import { swapQuoteSelector } from '@/features/swap/swap-state/utils/swap-quote-selection';
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
import { assertExistence } from '@leather.io/utils';

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
  strategy: SwapQuoteStrategy;
  fairMarketRate: number | null;
  slippage: number;
  queryOptions?: CustomQueryOptions<SwapQuote[], Error, SwapQuoteSelectionResult>;
}

export function useSwapQuotesQuery({
  swapService,
  baseSwapAsset,
  targetSwapAsset,
  baseAmount,
  strategy,
  fairMarketRate,
  slippage,
  queryOptions,
}: UseSwapQuotesQueryParams) {
  const debounceDelay = 350;
  const debouncedBaseAmount = useDebouncedValue(baseAmount, debounceDelay);

  return useQuery({
    queryKey: ['swap-quotes', { baseSwapAsset, targetSwapAsset, debouncedBaseAmount }],
    queryFn: async ({ signal }) => {
      if (!baseSwapAsset || !targetSwapAsset || !debouncedBaseAmount) return [];

      return swapService.getSwapQuotes(
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
}

interface UseSwapExecutionDataQueryParams {
  swapService: SwapService;
  accountRequest: AccountRequest;
  baseAmount?: number;
  quote?: SwapQuote;
  slippage: number;
  queryOptions?: CustomQueryOptions<SwapExecutionData>;
}

export function useSwapExecutionDataQuery({
  swapService,
  accountRequest,
  quote,
  baseAmount,
  slippage,
  queryOptions,
}: UseSwapExecutionDataQueryParams) {
  const isQuoteInSyncWithUserInput = quote?.baseAmount === baseAmount;

  return useQuery({
    queryKey: [
      'swap-execution-data',
      {
        accountRequest,
        baseAmount,
        executionType: quote?.executionType,
        providerId: quote?.providerId,
        quoteBaseAmount: quote?.baseAmount,
        targetAmount: quote?.targetAmount,
        slippage,
      },
    ],
    queryFn: ({ signal }) => {
      assertExistence(
        quote,
        `useSwapExecutionDataQuery expects a valid quote but got undefined.
         This means the hook ran without a quote even though it should be disabled.`
      );
      return swapService.getSwapExecutionData(accountRequest, quote, slippage, signal);
    },
    enabled: isDefined(quote) && isQuoteInSyncWithUserInput,
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
    refetchInterval: 30000, // Refetch every 30 seconds
    ...queryOptions,
  });
}
