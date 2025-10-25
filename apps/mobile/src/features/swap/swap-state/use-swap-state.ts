import { useMemo, useReducer } from 'react';

import { useDerivedAmounts } from '@/features/swap/swap-state/hooks/use-derived-amounts';
import { useIsSendingMax } from '@/features/swap/swap-state/hooks/use-is-sending-max';
import { useSecondaryAmount } from '@/features/swap/swap-state/hooks/use-secondary-amount';
import { useSwapExecutability } from '@/features/swap/swap-state/hooks/use-swap-executability';
import { DEFAULT_SLIPPAGE_PERCENTAGE } from '@/features/swap/swap-state/swap.constants';
import {
  useAccountBaseSwapAssetsQuery,
  useAccountTargetSwapAssetsQuery,
  useAssetMarketDataQuery,
} from '@/features/swap/swap-state/swap.queries';

import { AccountAddresses, QuoteCurrency, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset, MarketDataService, SwapService } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { createSwapActions } from './actions/swap-actions';
import { useSwapAssetReconciliation } from './hooks/use-swap-asset-reconciliation';
import { useSwapQuotes } from './hooks/use-swap-quotes';
import { useSwapValidation } from './hooks/use-swap-validation';
import { swapReducer } from './swap-state.reducer';
import { SwapInternalState, UseSwapStateResult } from './swap-state.types';

export interface UseSwapStateProps {
  accountRequest: { account: AccountAddresses };
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  marketDataService: MarketDataService;
  swapService: SwapService;
  quoteCurrencyPreference: QuoteCurrency;
}

export function useSwapState({
  accountRequest,
  swapService,
  marketDataService,
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
}: UseSwapStateProps): UseSwapStateResult {
  const [state, dispatch] = useReducer(
    swapReducer,
    { baseAsset, targetAsset, quoteCurrencyPreference },
    initializeState
  );

  const baseMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.baseSwapAsset?.asset,
  });

  const targetMarketDataQuery = useAssetMarketDataQuery({
    marketDataService,
    asset: state.targetSwapAsset?.asset,
  });

  const baseAssetsQuery = useAccountBaseSwapAssetsQuery({
    accountRequest,
    swapService,
  });

  const targetAssetsQuery = useAccountTargetSwapAssetsQuery({
    swapService,
    accountRequest,
    baseId: state.baseSwapAsset ? getAssetId(state.baseSwapAsset?.asset) : undefined,
  });

  useSwapAssetReconciliation({
    baseSwapAssets: baseAssetsQuery.data,
    targetSwapAssets: targetAssetsQuery.data,
    dispatch,
  });

  const { derivedAmounts, lockDerivedAmountsForNextRender } = useDerivedAmounts(
    state,
    baseMarketDataQuery.data
  );

  const secondaryAmount = useSecondaryAmount({
    state,
    baseMarketDataQuery,
    derivedAmounts,
  });

  const isSendingMax = useIsSendingMax({
    baseSwapAsset: state.baseSwapAsset,
    inputCurrencyMode: state.inputCurrencyMode,
    derivedAmounts,
  });

  const { quoteQuery } = useSwapQuotes({
    swapService,
    state,
    derivedAmounts,
    baseMarketData: baseMarketDataQuery.data,
    targetMarketData: targetMarketDataQuery.data,
  });

  const validation = useSwapValidation({ state, derivedAmounts });

  const actions = useMemo(
    () => createSwapActions({ dispatch, lockDerivedAmountsForNextRender, state, derivedAmounts }),
    [lockDerivedAmountsForNextRender, state, derivedAmounts]
  );

  const isSwapExecutable = useSwapExecutability({ validation, quoteQuery, derivedAmounts });

  return {
    state: {
      ...state,
      secondaryAmount,
      assetFlippingAllowed: isAssetFlippingAllowed(state.baseSwapAsset, state.targetSwapAsset),
      isSendingMax,
    },
    actions,
    validation,
    baseAssetsQuery,
    targetAssetsQuery,
    quoteQuery,
    isSwapExecutable,
  };
}

export interface InitializeStateParams {
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
}

function initializeState({
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
}: InitializeStateParams): SwapInternalState {
  const baseSwapAsset = baseAsset ? { asset: baseAsset, providerAssets: [] } : null;
  const targetSwapAsset = targetAsset ? { asset: targetAsset, providerAssets: [] } : null;

  return {
    baseSwapAsset: baseSwapAsset,
    targetSwapAsset: targetSwapAsset,
    pairReconciliation: {
      base: 'pending',
      target: 'pending',
    },
    nonce: undefined,
    baseAmount: '0',
    quoteCurrencyPreference,
    quoteStrategy: 'best',
    inputCurrencyMode: 'crypto',
    slippage: DEFAULT_SLIPPAGE_PERCENTAGE,
    selectingAsset: null,
  };
}

function isAssetFlippingAllowed(
  baseSwapAsset: AccountSwapAsset | null,
  targetSwapAsset: AccountSwapAsset | null
) {
  return baseSwapAsset !== null && targetSwapAsset !== null;
}
