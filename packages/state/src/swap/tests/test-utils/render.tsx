import React from 'react';

import * as btc from '@scure/btc-signer';
import { STACKS_MAINNET } from '@stacks/network';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { type MarketData, type NetworkConfiguration, type SwapQuote } from '@leather.io/models';
import { type AccountSwapAsset } from '@leather.io/services';

import {
  type DisabledPairRule,
  type SwapDependencies,
  type TrackEvent,
} from '../../swap-state.types';
import { type UseSwapStateProps, useSwapState } from '../../use-swap-state';
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

vi.mock('@leather.io/ui', () => ({
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
  network?: NetworkConfiguration;
  swapQuotes?: SwapQuote[];
  getSwapQuotes?(): Promise<SwapQuote[]>;
  getBaseSwapAssets?(): Promise<AccountSwapAsset[]>;
  getTargetSwapAssets?(): Promise<AccountSwapAsset[]>;
  marketData: MarketData;
  maxSpendAmount?: number;
  dependencies?: Partial<SwapDependencies>;
  disabledPairs?: DisabledPairRule[];
  trackEvent?: TrackEvent;
}

export function renderUseSwapState({
  quoteCurrencyPreference = 'USD',
  baseSwapAssets,
  targetSwapAssets,
  swapQuotes,
  getSwapQuotes,
  getBaseSwapAssets,
  getTargetSwapAssets,
  marketData,
  maxSpendAmount,
  network,
  dependencies,
  disabledPairs,
  trackEvent,
  ...rest
}: Partial<RenderUseSwapStateParams> = {}) {
  const { result } = renderHookWithProviders(() =>
    useSwapState({
      quoteCurrencyPreference,
      disabledPairs,
      trackEvent: trackEvent ?? (() => Promise.resolve()),
      dependencies: {
        accountRequest: createAccountRequest(),
        services: {
          swapService: createStubSwapService({
            baseSwapAssets,
            targetSwapAssets,
            swapQuotes,
            getSwapQuotes,
            getBaseSwapAssets,
            getTargetSwapAssets,
          }),
          marketDataService: createStubMarketDataService({ marketData }),
          bitcoinTransactionFeesService: createStubBitcoinTransactionFeesService(),
          bitcoinCoinSelectionService: createStubBitcoinCoinSelectionService({ maxSpendAmount }),
          stacksTransactionFeesService: createStubStacksTransactionFeesService(),
        },
        stacks: {
          stacksSigner: createStubStacksSigner(),
          stacksNetwork: STACKS_MAINNET,
          broadcast: () => Promise.resolve({ ok: true, txid: 'test-txid' }),
          nextNonce: undefined,
        },
        bitcoin: {
          bitcoinPayer: createStubBitcoinPayer(),
          network: network ?? createStubNetwork(),
          signBitcoinPsbt: psbt => Promise.resolve(btc.Transaction.fromPSBT(psbt)),
          broadcast: () => Promise.resolve({ status: 'accepted' as const }),
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
