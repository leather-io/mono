import { type UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { doNothing } from 'remeda';
import { vi } from 'vitest';

import { type ExecutionConstraint, type MarketData } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  type EnrichedSwapQuote,
  type NetworkFee,
  type SwapQuoteSelectionResult,
} from '../swap-state.types';
import { createSwapQuote, defaultBtcAsset, defaultStxAsset } from '../tests/test-utils/fixtures';
import { useLiveSwapEstimate } from './use-live-swap-estimate';

vi.mock('@leather.io/ui', () => ({
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
    rawSwapQuote: createSwapQuote(),
    swapRate: new BigNumber(1),
    dexPath: [],
    assetPath: [],
    baseAsset: defaultBtcAsset,
    targetAsset: defaultStxAsset,
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

export function createMockNetworkFee(
  overrides: Partial<Extract<NetworkFee, { mode: 'fixed' }>> = {}
): NetworkFee {
  return {
    mode: 'fixed',
    calculation: {
      type: 'stacksFeeRate',
      value: createMoney(1000, 'STX'),
      rate: 1,
      rateUnit: 'µSTX/byte',
      estimatedTxSize: 1000,
      sizeUnit: 'byte',
    },
    ...overrides,
  };
}

function createMockMarketData(overrides: Partial<MarketData> = {}): MarketData {
  return {
    pair: { base: 'BTC', quote: 'USD' },
    price: createMoney(5000000, 'USD', 2),
    ...overrides,
  };
}

interface PendingQueryOverrides {
  isPending: true;
  isFetching: boolean;
}

interface ErrorQueryOverrides {
  isError: true;
  error: Error;
}

interface SuccessQueryOverrides<T> {
  isSuccess: true;
  data: T;
  isFetching?: boolean;
  isRefetching?: boolean;
}

type MockQueryOverrides<T> = PendingQueryOverrides | ErrorQueryOverrides | SuccessQueryOverrides<T>;

function createMockQueryBase() {
  return {
    isFetching: false,
    isRefetching: false,
    isLoading: false,
    isInitialLoading: false,
    isPaused: false,
    isEnabled: true,
    isFetched: true,
    isFetchedAfterMount: true,
    isStale: false,
    fetchStatus: 'idle',
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
  } as const;
}

export function createMockQuery<T>(overrides: MockQueryOverrides<T>): UseQueryResult<T> {
  if ('isError' in overrides) {
    return {
      ...createMockQueryBase(),
      data: undefined,
      error: overrides.error,
      isError: true,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      refetch: vi.fn().mockResolvedValue({ data: undefined }),
      promise: new Promise<T>(doNothing()),
    };
  }
  if ('isSuccess' in overrides) {
    return {
      ...createMockQueryBase(),
      isFetching: overrides.isFetching ?? false,
      isRefetching: overrides.isRefetching ?? false,
      data: overrides.data,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      status: 'success',
      refetch: vi.fn().mockResolvedValue({ data: overrides.data }),
      promise: Promise.resolve(overrides.data),
    };
  }
  return {
    ...createMockQueryBase(),
    isFetching: overrides.isFetching,
    data: undefined,
    error: null,
    isError: false,
    isPending: true,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: false,
    isPlaceholderData: false,
    status: 'pending',
    refetch: vi.fn().mockResolvedValue({ data: undefined }),
    promise: new Promise<T>(doNothing()),
  };
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

interface RenderHookOptions {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult>;
  networkFeeQuery?: UseQueryResult<NetworkFee>;
  baseMarketDataQuery?: UseQueryResult<MarketData>;
  nativeAssetMarketDataQuery?: UseQueryResult<MarketData>;
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
