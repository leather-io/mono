import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { currencyDecimalsMap } from '@leather.io/constants';
import { assertUnreachable, isSameAsset } from '@leather.io/utils';

import { SwapActionObject, SwapInternalState } from './swap-state.types';
import { adjustAmountForDecimals } from './utils/amount-operations';

export function swapReducer(state: SwapInternalState, action: SwapActionObject): SwapInternalState {
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
      if (state.targetSwapAsset && isSameAsset(action.payload.asset, state.targetSwapAsset.asset)) {
        return createFlippedState(state);
      }

      return {
        ...state,
        pairReconciliation: {
          ...state.pairReconciliation,
          target: 'pending',
        },
        baseSwapAsset: action.payload,
        baseAmount: adjustAmountForDecimals(
          state.baseAmount,
          whenInputCurrencyMode(state.inputCurrencyMode)({
            crypto: action.payload.asset.decimals,
            quote: currencyDecimalsMap[state.quoteCurrencyPreference] ?? 2,
          })
        ),
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
      if (!state.baseSwapAsset || !state.targetSwapAsset) return state;

      return createFlippedState(state);
    }
    case 'RECONCILE_BASE_WITH_PROVIDER': {
      const { baseSwapAsset, pairReconciliation } = state;
      if (pairReconciliation.base === 'complete') return state;
      if (!baseSwapAsset) return state;

      const realBaseSwapAsset = action.payload.find(swapAsset => {
        return isSameAsset(swapAsset.asset, baseSwapAsset.asset);
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
        return isSameAsset(swapAsset.asset, targetSwapAsset.asset);
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
    case 'TOGGLE_INPUT_CURRENCY_MODE': {
      return {
        ...state,
        inputCurrencyMode: state.inputCurrencyMode === 'crypto' ? 'quote' : 'crypto',
        baseAmount: action.payload.nextBaseAmount,
      };
    }
    case 'SET_FEE_TIER':
      return {
        ...state,
        feeTier: action.payload,
        customFee: null,
      };
    case 'SET_CUSTOM_FEE':
      return {
        ...state,
        customFee: action.payload,
      };
    case 'SET_SLIPPAGE': {
      return {
        ...state,
        slippage: action.payload,
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

function createFlippedState(state: SwapInternalState): SwapInternalState {
  return {
    ...state,
    baseSwapAsset: state.targetSwapAsset,
    targetSwapAsset: state.baseSwapAsset,
    baseAmount: '0',
    pairReconciliation: {
      base: 'pending',
      target: 'pending',
    },
    selectingAsset: null,
  };
}
