import { SwapDependencies } from '@/features/swap/swap-state/swap-state.types';
import { renderHookWithProviders } from '@/tests/test-utils';
import { STACKS_MAINNET } from '@stacks/network';
import { vi } from 'vitest';

import { MarketData, SwapQuote } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

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

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: <T>(value: T) => value,
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
}

export function renderUseSwapState({
  quoteCurrencyPreference = 'USD',
  baseSwapAssets,
  targetSwapAssets,
  swapQuotes,
  marketData,
  maxSpendAmount,
  dependencies,
  ...rest
}: Partial<RenderUseSwapStateParams> = {}) {
  const { result } = renderHookWithProviders(() =>
    useSwapState({
      quoteCurrencyPreference,
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
