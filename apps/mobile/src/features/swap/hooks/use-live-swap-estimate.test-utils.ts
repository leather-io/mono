import { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { vi } from 'vitest';

import { ExecutionConstraint, MarketData } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  EnrichedSwapQuote,
  NetworkFee,
  SwapQuoteSelectionResult,
} from '../swap-state/swap-state.types';
import { useLiveSwapEstimate } from './use-live-swap-estimate';

vi.mock('@leather.io/ui/native', () => ({
  useInterval: vi.fn(() => ({
    interval: 30000,
    lastStartedAt: null,
    nextRunTime: null,
  })),
}));

export function createMockEnrichedQuote(
  overrides: Partial<EnrichedSwapQuote> = {}
): EnrichedSwapQuote {
  return {
    rawSwapQuote: {} as EnrichedSwapQuote['rawSwapQuote'],
    swapRate: new BigNumber(1),
    dexPath: [],
    assetPath: [],
    baseAsset: {} as EnrichedSwapQuote['baseAsset'],
    targetAsset: {} as EnrichedSwapQuote['targetAsset'],
    baseAmount: createMoney(100000000, 'BTC'),
    targetAmount: createMoney(500000000, 'STX'),
    isExecutable: true,
    executionConstraints: [],
    createdAt: new Date(),
    slippageApplicable: true,
    provider: 'alex-sdk',
    score: 100,
    priceImpactPercentage: null,
    ...overrides,
  };
}

export function createMockNetworkFee(overrides: Partial<NetworkFee> = {}): NetworkFee {
  return {
    mode: 'fixed',
    calculation: {
      type: 'stacksFeeRate',
      value: createMoney(1000, 'STX'),
      rate: 1,
      rateUnit: 'μSTX/byte',
      estimatedTxSize: 1000,
      sizeUnit: 'byte',
    },
    ...overrides,
  } as NetworkFee;
}

export function createMockMarketData(overrides: Partial<MarketData> = {}): MarketData {
  return {
    pair: { base: 'BTC', quote: 'USD' },
    price: createMoney(5000000, 'USD', 2),
    ...overrides,
  } as MarketData;
}

interface MockQueryOverrides<T> {
  data?: T;
  error?: Error | null;
  isPending?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  isRefetching?: boolean;
}

export function createMockQuery<T>(
  overrides: MockQueryOverrides<T> = {}
): UseQueryResult<T, Error> {
  return {
    data: undefined,
    error: null,
    isPending: false,
    isFetching: false,
    isError: false,
    isSuccess: false,
    isRefetching: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isStale: false,
    status: 'success',
    fetchStatus: 'idle',
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    refetch: vi.fn().mockResolvedValue({ data: overrides.data }),
    ...overrides,
  } as unknown as UseQueryResult<T, Error>;
}

export function createSelectedQuoteResult(quote?: EnrichedSwapQuote): SwapQuoteSelectionResult {
  const selected = quote ?? createMockEnrichedQuote();
  return { quotes: [selected], selected };
}

export function createEmptyQuoteResult(): SwapQuoteSelectionResult {
  return { quotes: [], selected: undefined, unmetConstraints: [] };
}

export function createConstrainedQuoteResult(
  constraints: ExecutionConstraint[]
): SwapQuoteSelectionResult {
  return {
    quotes: [createMockEnrichedQuote({ isExecutable: false, executionConstraints: constraints })],
    selected: undefined,
    unmetConstraints: constraints,
  };
}

export interface RenderHookOptions {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  networkFeeQuery?: UseQueryResult<NetworkFee, Error>;
  baseMarketDataQuery?: UseQueryResult<MarketData, Error>;
  nativeAssetMarketDataQuery?: UseQueryResult<MarketData, Error>;
}

export function renderUseLiveSwapEstimate(initialOptions: RenderHookOptions) {
  const defaultNetworkFeeQuery = createMockQuery({ isSuccess: true, data: createMockNetworkFee() });
  const defaultBaseMarketDataQuery = createMockQuery({
    isSuccess: true,
    data: createMockMarketData(),
  });
  const defaultNativeAssetMarketDataQuery = createMockQuery({
    isSuccess: true,
    data: createMockMarketData({ pair: { base: 'STX', quote: 'USD' } }),
  });

  return renderHook(
    (options: RenderHookOptions) =>
      useLiveSwapEstimate({
        quoteQuery: options.quoteQuery,
        networkFeeQuery: options.networkFeeQuery ?? defaultNetworkFeeQuery,
        baseMarketDataQuery: options.baseMarketDataQuery ?? defaultBaseMarketDataQuery,
        nativeAssetMarketDataQuery:
          options.nativeAssetMarketDataQuery ?? defaultNativeAssetMarketDataQuery,
      }),
    { initialProps: initialOptions }
  );
}
