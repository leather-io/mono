import { useCallback, useReducer } from 'react';

import { useBaseAssets, useTargetAssets } from '@/features/swap/data';
import { areSameAssets } from '@/features/swap/helpers';
import {
  AccountSwapAsset,
  getAccountBaseSwapAssets,
  getAccountTargetSwapAssets,
} from '@/features/swap/temp/service';
import { InputCurrencyMode } from '@/utils/types';

import { CryptoAssetId, FungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export interface SwapState {
  baseSwapAsset: AccountSwapAsset | null;
  targetSwapAsset: AccountSwapAsset | null;
  pairValidation: {
    base: 'pending' | 'validated';
    target: 'pending' | 'validated';
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
  | { type: 'VALIDATE_BASE_ASSET'; payload: AccountSwapAsset[] }
  | { type: 'VALIDATE_TARGET_ASSET'; payload: AccountSwapAsset[] }
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
        pairValidation: {
          ...state.pairValidation,
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
    case 'VALIDATE_BASE_ASSET': {
      const { baseSwapAsset, pairValidation } = state;
      if (pairValidation.base === 'validated') return state;
      if (!baseSwapAsset) return state;

      const realBaseSwapAsset = action.payload.find(swapAsset => {
        return areSameAssets(swapAsset.asset, baseSwapAsset.asset);
      });

      if (realBaseSwapAsset) {
        return {
          ...state,
          baseSwapAsset: realBaseSwapAsset,
          pairValidation: {
            ...pairValidation,
            base: 'validated',
          },
        };
      }

      return {
        ...state,
        baseSwapAsset: null,
        targetSwapAsset: null,
        baseAmount: '0',
        targetAmount: '0',
        pairValidation: {
          base: 'pending',
          target: 'pending',
        },
      };
    }
    case 'VALIDATE_TARGET_ASSET': {
      const { targetSwapAsset, pairValidation } = state;

      if (!targetSwapAsset) return state;

      const realTargetSwapAsset = action.payload.find(swapAsset => {
        return areSameAssets(swapAsset.asset, targetSwapAsset.asset);
      });

      if (realTargetSwapAsset) {
        return {
          ...state,
          targetSwapAsset: realTargetSwapAsset,
          pairValidation: {
            ...state.pairValidation,
            target: 'validated',
          },
        };
      }

      return {
        ...state,
        targetSwapAsset: null,
        targetAmount: '0',
        pairValidation: {
          ...pairValidation,
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
    pairValidation: {
      base: 'pending',
      target: 'pending',
    },
    nonce: undefined,
    baseAmount: '0',
    targetAmount: '0',
    activeAmountField: 'base',
    inputCurrencyMode: 'crypto',
    slippage: 0.03,
    slippageEditingAllowed: true,
    selectingAsset: null,
    validation: [],
  };
}

interface UseSwapStateProps {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
  baseAssetGetterFn?: () => Promise<AccountSwapAsset[]>;
  targetAssetGetterFn?: (assetId: CryptoAssetId) => Promise<AccountSwapAsset[]>;
}

export function useSwapState({
  baseAsset,
  targetAsset,
  baseAssetGetterFn = getAccountBaseSwapAssets,
  targetAssetGetterFn = getAccountTargetSwapAssets,
}: UseSwapStateProps = {}) {
  const [state, dispatch] = useReducer(swapReducer, { baseAsset, targetAsset }, initializeState);
  // TODO: Consider using hook creators for those
  const baseAssetsQuery = useBaseAssets(baseAssetGetterFn, {
    onSuccess: data => {
      dispatch({ type: 'VALIDATE_BASE_ASSET', payload: data });
    },
  });
  const targetAssetsQuery = useTargetAssets(targetAssetGetterFn, state.baseSwapAsset, {
    onSuccess: data => {
      dispatch({ type: 'VALIDATE_TARGET_ASSET', payload: data });
    },
  });

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
