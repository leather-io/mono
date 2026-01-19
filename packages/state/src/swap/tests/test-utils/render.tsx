import React from 'react';

import { STACKS_MAINNET } from '@stacks/network';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { MarketData, SwapQuote } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

import { DisabledPairRule, SwapDependencies } from '../../swap-state.types';
import { UseSwapStateProps, useSwapState } from '../../use-swap-state';
import { createAccountRequest } from './fixtures';
import {
  createStubBitcoinCoinSelectionService,
  createStubBitcoinPayer,
  createStubBitcoinTransactionFeesService,
  createStubMarketDataService,
  createStubNetwork,
  createStubStacksSigner,
  createStubStacksTransactionFeesService,
  createStubSwapService,
} from './services.stub';

vi.mock('@leather.io/ui/native', () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

vi.mock('@leather.io/utils', async () => {
  return {
    ...(await vi.importActual('@leather.io/utils')),
    delay: () => Promise.resolve(),
  };
});

interface RenderUseSwapStateParams extends Omit<UseSwapStateProps, 'dependencies' | 'trackEvent'> {
  baseSwapAssets?: AccountSwapAsset[];
  targetSwapAssets?: AccountSwapAsset[];
  swapQuotes?: SwapQuote[];
  marketData: MarketData;
  maxSpendAmount?: number;
  dependencies?: Partial<SwapDependencies>;
  disabledPairs?: DisabledPairRule[];
}

export function renderUseSwapState({
  quoteCurrencyPreference = 'USD',
  baseSwapAssets,
  targetSwapAssets,
  swapQuotes,
  marketData,
  maxSpendAmount,
  dependencies,
  disabledPairs,
  ...rest
}: Partial<RenderUseSwapStateParams> = {}) {
  const { result } = renderHookWithProviders(() =>
    useSwapState({
      quoteCurrencyPreference,
      disabledPairs,
      trackEvent: () => Promise.resolve(),
      dependencies: {
        accountRequest: createAccountRequest(),
        services: {
          swapService: createStubSwapService({ baseSwapAssets, targetSwapAssets, swapQuotes }),
          marketDataService: createStubMarketDataService({ marketData }),
          bitcoinTransactionFeesService: createStubBitcoinTransactionFeesService(),
          bitcoinCoinSelectionService: createStubBitcoinCoinSelectionService({ maxSpendAmount }),
          stacksTransactionFeesService: createStubStacksTransactionFeesService(),
        },
        stacks: {
          stacksSigner: createStubStacksSigner(),
          stacksNetwork: STACKS_MAINNET,
          broadcast: () => Promise.resolve({ ok: true, txid: 'test-txid' }) as any,
          nextNonce: undefined,
        },
        bitcoin: {
          bitcoinPayer: createStubBitcoinPayer(),
          network: createStubNetwork(),
          sbtcClient: {} as any,
          signBitcoinPsbt: () => ({}) as any,
          broadcast: () => Promise.resolve('test-txid'),
        },
        ...dependencies,
      },
      ...rest,
    })
  );
  return result;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
        refetchInterval: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: { initialProps?: TProps }
) {
  return renderHook<TResult, TProps>(hook, {
    wrapper: createWrapper(),
    initialProps: options?.initialProps,
  });
}
