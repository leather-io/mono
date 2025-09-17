import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { areSameAssets } from '@/features/swap/helpers';
import {
  createAccountBaseSwapAssetsQuery,
  createAccountTargetSwapAssetsQuery,
} from '@/features/swap/swap.queries';
import { InputCurrencyMode } from '@/utils/types';

import { FungibleCryptoAsset } from '@leather.io/models';
import { AccountSwapAsset, SwapService, getSwapService } from '@leather.io/services';
import { assertUnreachable, getAssetId } from '@leather.io/utils';

const defaultSlippagePercentage = 0.03;

export interface SwapState {
  baseSwapAsset: AccountSwapAsset | null;
  targetSwapAsset: AccountSwapAsset | null;
  pairReconciliation: {
    base: 'pending' | 'complete';
    target: 'pending' | 'complete';
  };
  baseAmount: string;
  targetAmount: string;
  slippage: number;
  slippageEditingAllowed: boolean;
  nonce?: number;
  inputCurrencyMode: InputCurrencyMode;
  activeAmountField: 'base' | 'target';
  selectingAsset: 'base' | 'target' | null;
  validation: []; // TODO
}

type SwapAction =
  | { type: 'SET_BASE_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'SET_TARGET_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'CLEAR_ASSET_SELECTION' }
  | { type: 'FLIP_ASSETS' }
  | { type: 'RECONCILE_BASE_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'RECONCILE_TARGET_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'SET_BASE_AMOUNT'; payload: string }
  | { type: 'SET_TARGET_AMOUNT'; payload: string }
  | { type: 'SET_INPUT_CURRENCY_MODE'; payload: 'crypto' | 'quote' }
  | { type: 'SET_ACTIVE_AMOUNT_FIELD'; payload: 'base' | 'target' }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'TOGGLE_SLIPPAGE_EDITING'; payload: boolean }
  | { type: 'SET_NONCE'; payload: number }
  | { type: 'OPEN_ASSET_SELECTOR'; payload: 'base' | 'target' }
  | { type: 'CLOSE_ASSET_SELECTOR' };

function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case 'OPEN_ASSET_SELECTOR': {
      return {
        ...state,
        selectingAsset: action.payload,
      };
    }
    case 'CLOSE_ASSET_SELECTOR': {
      return {
        ...state,
        selectingAsset: null,
      };
    }
    case 'SET_BASE_SWAP_ASSET': {
      return {
        ...state,
        pairReconciliation: {
          ...state.pairReconciliation,
          target: 'pending',
        },
        baseSwapAsset: action.payload,
        selectingAsset: null,
      };
    }
    case 'SET_TARGET_SWAP_ASSET': {
      return {
        ...state,
        targetSwapAsset: action.payload,
        selectingAsset: null,
      };
    }
    case 'CLEAR_ASSET_SELECTION': {
      return {
        ...state,
        baseSwapAsset: null,
        targetSwapAsset: null,
      };
    }
    case 'FLIP_ASSETS': {
      return {
        ...state,
        baseSwapAsset: state.targetSwapAsset,
        targetSwapAsset: state.baseSwapAsset,
      };
    }
    // TODO: Carefully construct many test cases for this
    case 'RECONCILE_BASE_WITH_PROVIDER': {
      const { baseSwapAsset, pairReconciliation } = state;
      if (pairReconciliation.base === 'complete') return state;
      if (!baseSwapAsset) return state;

      const realBaseSwapAsset = action.payload.find(swapAsset => {
        return areSameAssets(swapAsset.asset, baseSwapAsset.asset);
      });

      if (realBaseSwapAsset) {
        return {
          ...state,
          baseSwapAsset: realBaseSwapAsset,
          pairReconciliation: {
            ...pairReconciliation,
            base: 'complete',
          },
        };
      }

      return {
        ...state,
        baseSwapAsset: null,
        targetSwapAsset: null,
        baseAmount: '0',
        targetAmount: '0',
        pairReconciliation: {
          base: 'pending',
          target: 'pending',
        },
      };
    }
    case 'RECONCILE_TARGET_WITH_PROVIDER': {
      const { targetSwapAsset, pairReconciliation } = state;

      if (!targetSwapAsset) {
        return {
          ...state,
          pairReconciliation: {
            ...state.pairReconciliation,
            target: 'complete',
          },
        };
      }

      const realTargetSwapAsset = action.payload.find(swapAsset => {
        return areSameAssets(swapAsset.asset, targetSwapAsset.asset);
      });

      if (realTargetSwapAsset) {
        return {
          ...state,
          targetSwapAsset: realTargetSwapAsset,
          pairReconciliation: {
            ...state.pairReconciliation,
            target: 'complete',
          },
        };
      }

      return {
        ...state,
        targetSwapAsset: null,
        targetAmount: '0',
        pairReconciliation: {
          ...pairReconciliation,
          target: 'pending',
        },
      };
    }
    case 'SET_BASE_AMOUNT': {
      return {
        ...state,
        baseAmount: action.payload,
      };
    }

    case 'SET_TARGET_AMOUNT': {
      return {
        ...state,
        targetAmount: action.payload,
      };
    }
    case 'SET_INPUT_CURRENCY_MODE': {
      return {
        ...state,
        inputCurrencyMode: action.payload,
      };
    }
    case 'SET_ACTIVE_AMOUNT_FIELD': {
      return {
        ...state,
        activeAmountField: action.payload,
      };
    }
    case 'SET_SLIPPAGE': {
      return {
        ...state,
        slippage: action.payload,
      };
    }
    case 'TOGGLE_SLIPPAGE_EDITING': {
      return {
        ...state,
        slippageEditingAllowed: action.payload,
      };
    }
    case 'SET_NONCE': {
      return {
        ...state,
        nonce: action.payload,
      };
    }
    default: {
      return assertUnreachable(action);
    }
  }
}

interface InitializeStateParams {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
}

function initializeState({ baseAsset, targetAsset }: InitializeStateParams): SwapState {
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
    targetAmount: '0',
    activeAmountField: 'base',
    inputCurrencyMode: 'crypto',
    slippage: defaultSlippagePercentage,
    slippageEditingAllowed: true,
    selectingAsset: null,
    validation: [],
  };
}

interface UseSwapStateProps {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
  swapService?: SwapService;
}

export function useSwapState({
  baseAsset,
  targetAsset,
  swapService = getSwapService(),
}: UseSwapStateProps = {}) {
  const [state, dispatch] = useReducer(swapReducer, { baseAsset, targetAsset }, initializeState);

  const queries = useMemo(() => {
    return {
      useAccountBaseSwapAssetsQuery: createAccountBaseSwapAssetsQuery(swapService),
      useAccountTargetSwapAssetsQuery: createAccountTargetSwapAssetsQuery(swapService),
    };
  }, [swapService]);

  const baseAssetsQuery = queries.useAccountBaseSwapAssetsQuery();
  const targetAssetsQuery = queries.useAccountTargetSwapAssetsQuery({
    baseId: state.baseSwapAsset ? getAssetId(state.baseSwapAsset?.asset) : undefined,
  });

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

  const setTargetAmount = useCallback((amount: string) => {
    dispatch({ type: 'SET_TARGET_AMOUNT', payload: amount });
  }, []);

  const setInputCurrencyMode = useCallback((mode: InputCurrencyMode) => {
    dispatch({ type: 'SET_INPUT_CURRENCY_MODE', payload: mode });
  }, []);

  const setActiveAmountField = useCallback((field: 'base' | 'target') => {
    dispatch({ type: 'SET_ACTIVE_AMOUNT_FIELD', payload: field });
  }, []);

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

  return {
    state,
    baseAssetsQuery,
    targetAssetsQuery,
    actions: {
      setBaseSwapAsset,
      setTargetSwapAsset,
      setBaseAmount,
      setTargetAmount,
      setInputCurrencyMode,
      setActiveAmountField,
      setSlippage,
      toggleSlippageEditing,
      setNonce,
      clearAssetSelection,
      flipAssets,
      openAssetSelector,
      closeAssetSelector,
    },
  };
}
