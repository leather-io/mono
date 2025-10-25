import { convertMoneyToInputValue } from '@/features/swap/swap-state/utils/amount-operations';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { AccountSwapAsset } from '@leather.io/services';

import {
  DerivedAmounts,
  PresetPercentage,
  SwapActionObject,
  SwapInternalState,
} from '../swap-state.types';

interface CreateSwapActionsParams {
  dispatch: (action: SwapActionObject) => void;
  lockDerivedAmountsForNextRender: () => void;
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
}

export function createSwapActions({
  dispatch,
  lockDerivedAmountsForNextRender,
  state,
  derivedAmounts,
}: CreateSwapActionsParams) {
  return {
    setBaseSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_BASE_SWAP_ASSET', payload: asset });
    },

    setTargetSwapAsset(asset: AccountSwapAsset) {
      dispatch({ type: 'SET_TARGET_SWAP_ASSET', payload: asset });
    },

    setBaseAmount(amount: string) {
      dispatch({ type: 'SET_BASE_AMOUNT', payload: amount });
    },

    setBaseAmountByPercentage(percentage: PresetPercentage) {
      dispatch({ type: 'SET_BASE_AMOUNT_BY_PERCENTAGE', payload: percentage });
    },

    toggleInputCurrencyMode() {
      const nextBaseAmount = whenInputCurrencyMode(state.inputCurrencyMode)({
        crypto: convertMoneyToInputValue(derivedAmounts.quote),
        quote: convertMoneyToInputValue(derivedAmounts.crypto),
      });
      lockDerivedAmountsForNextRender();
      dispatch({
        type: 'TOGGLE_INPUT_CURRENCY_MODE',
        payload: { nextBaseAmount },
      });
    },

    setSlippage(slippage: number) {
      dispatch({ type: 'SET_SLIPPAGE', payload: slippage });
    },

    setNonce(nonce: number) {
      dispatch({ type: 'SET_NONCE', payload: nonce });
    },

    clearAssetSelection() {
      dispatch({ type: 'CLEAR_ASSET_SELECTION' });
    },

    flipAssets() {
      dispatch({ type: 'FLIP_ASSETS' });
    },

    openAssetSelector(type: 'base' | 'target') {
      dispatch({ type: 'OPEN_ASSET_SELECTOR', payload: type });
    },

    closeAssetSelector() {
      dispatch({ type: 'CLOSE_ASSET_SELECTOR' });
    },
  };
}
