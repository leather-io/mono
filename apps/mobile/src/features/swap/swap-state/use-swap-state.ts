import { useCallback, useEffect, useMemo, useReducer } from 'react';

import {
  computeSecondaryAmountState,
  convertMoneyToInputValue,
  createSwapAssetsSelector,
  isAmountEqualToAvailableBalance,
} from '@/features/swap/swap-state/swap-state.utils';
import { useDerivedAmounts } from '@/features/swap/swap-state/use-derived-amounts';
import { useSwapQueries } from '@/features/swap/swap-state/use-swap-queries';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { AccountAddresses, FungibleCryptoAsset, QuoteCurrency } from '@leather.io/models';
import { AccountSwapAsset, MarketDataService, SwapService } from '@leather.io/services';
import { getAssetId } from '@leather.io/utils';

import { defaultSlippagePercentage, swapReducer } from './swap-state.reducer';
import { PresetPercentage, SwapInternalState, UseSwapStateResult } from './swap-state.types';

export interface InitializeStateParams {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
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
    inputCurrencyMode: 'crypto',
    slippage: defaultSlippagePercentage,
    slippageEditingAllowed: true,
    selectingAsset: null,
    validation: [],
  };
}

export interface UseSwapStateProps {
  accountRequest: { account: AccountAddresses };
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
  marketDataService: MarketDataService;
  swapService: SwapService;
  // TODO: Come up with a better name. This is an adapter for assetVisibility.
  isAssetAllowed?: (asset: FungibleCryptoAsset) => boolean;
  quoteCurrencyPreference: QuoteCurrency;
}

export function useSwapState({
  accountRequest,
  swapService,
  marketDataService,
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
  isAssetAllowed,
}: UseSwapStateProps): UseSwapStateResult {
  const [state, dispatch] = useReducer(
    swapReducer,
    { baseAsset, targetAsset, quoteCurrencyPreference },
    initializeState
  );

  const queries = useSwapQueries({ swapService, marketDataService, accountRequest });

  const baseAssetsQuery = queries.useAccountBaseSwapAssetsQuery({
    queryOptions: { select: createSwapAssetsSelector('base', isAssetAllowed) },
  });
  const targetAssetsQuery = queries.useAccountTargetSwapAssetsQuery({
    baseId: state.baseSwapAsset ? getAssetId(state.baseSwapAsset?.asset) : undefined,
    queryOptions: { select: createSwapAssetsSelector('target', isAssetAllowed) },
  });
  const marketDataQuery = queries.useAssetMarketDataQuery({
    asset: state.baseSwapAsset?.asset,
  });
  const quoteQuery = queries.useSwapQuoteQuery({
    baseSwapAsset: state.baseSwapAsset,
    targetSwapAsset: state.targetSwapAsset,
    baseAmount: Number(state.baseAmount),
  });

  const { derivedAmounts, lockDerivedAmountsForNextRender } = useDerivedAmounts(
    state,
    marketDataQuery.data
  );

  useEffect(() => {
    if (baseAssetsQuery.data) {
      dispatch({ type: 'RECONCILE_BASE_WITH_PROVIDER', payload: baseAssetsQuery.data });
    }
  }, [baseAssetsQuery.data]);

  useEffect(() => {
    if (targetAssetsQuery.data) {
      dispatch({ type: 'RECONCILE_TARGET_WITH_PROVIDER', payload: targetAssetsQuery.data });
    }
  }, [targetAssetsQuery.data]);

  const setBaseSwapAsset = useCallback((asset: AccountSwapAsset) => {
    dispatch({ type: 'SET_BASE_SWAP_ASSET', payload: asset });
  }, []);

  const setTargetSwapAsset = useCallback((asset: AccountSwapAsset) => {
    dispatch({ type: 'SET_TARGET_SWAP_ASSET', payload: asset });
  }, []);

  const clearAssetSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_ASSET_SELECTION' });
  }, []);

  const flipAssets = useCallback(() => {
    dispatch({ type: 'FLIP_ASSETS' });
  }, []);

  const setBaseAmount = useCallback((amount: string) => {
    dispatch({ type: 'SET_BASE_AMOUNT', payload: amount });
  }, []);

  const setBaseAmountByPercentage = useCallback((percentage: PresetPercentage) => {
    dispatch({ type: 'SET_BASE_AMOUNT_BY_PERCENTAGE', payload: percentage });
  }, []);

  const toggleInputCurrencyMode = useCallback(() => {
    const nextBaseAmount = whenInputCurrencyMode(state.inputCurrencyMode)({
      crypto: convertMoneyToInputValue(derivedAmounts.quote),
      quote: convertMoneyToInputValue(derivedAmounts.crypto),
    });

    lockDerivedAmountsForNextRender();
    dispatch({
      type: 'TOGGLE_INPUT_CURRENCY_MODE',
      payload: { nextBaseAmount: nextBaseAmount },
    });
  }, [state.inputCurrencyMode, derivedAmounts, lockDerivedAmountsForNextRender]);

  const setSlippage = useCallback((slippage: number) => {
    dispatch({ type: 'SET_SLIPPAGE', payload: slippage });
  }, []);

  const toggleSlippageEditing = useCallback((allowed: boolean) => {
    dispatch({ type: 'TOGGLE_SLIPPAGE_EDITING', payload: allowed });
  }, []);

  const setNonce = useCallback((nonce: number) => {
    dispatch({ type: 'SET_NONCE', payload: nonce });
  }, []);

  const openAssetSelector = useCallback((type: 'base' | 'target') => {
    dispatch({ type: 'OPEN_ASSET_SELECTOR', payload: type });
  }, []);

  const closeAssetSelector = useCallback(() => {
    dispatch({ type: 'CLOSE_ASSET_SELECTOR' });
  }, []);

  const secondaryAmount = computeSecondaryAmountState({
    state,
    queryStatus: marketDataQuery.status,
    isFetching: marketDataQuery.isFetching,
    derivedAmounts,
  });

  const isSendingMax = useMemo(
    () =>
      isAmountEqualToAvailableBalance(derivedAmounts, state.baseSwapAsset, state.inputCurrencyMode),
    [derivedAmounts, state.baseSwapAsset, state.inputCurrencyMode]
  );

  return {
    state: {
      ...state,
      secondaryAmount,
      assetFlippingAllowed: state.baseSwapAsset !== null && state.targetSwapAsset !== null,
      isSendingMax,
    },
    actions: {
      setBaseSwapAsset,
      setTargetSwapAsset,
      setBaseAmount,
      setBaseAmountByPercentage,
      toggleInputCurrencyMode,
      setSlippage,
      toggleSlippageEditing,
      setNonce,
      clearAssetSelection,
      flipAssets,
      openAssetSelector,
      closeAssetSelector,
    },
    baseAssetsQuery,
    targetAssetsQuery,
    quoteQuery,
  };
}
