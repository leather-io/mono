import { InputCurrencyMode } from '@/utils/types';
import { UseQueryResult } from '@tanstack/react-query';

import { Money, QuoteCurrency } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export interface SwapInternalState {
  baseSwapAsset: AccountSwapAsset | null;
  targetSwapAsset: AccountSwapAsset | null;
  pairReconciliation: {
    base: 'pending' | 'complete';
    target: 'pending' | 'complete';
  };
  baseAmount: string;
  slippage: number;
  slippageEditingAllowed: boolean;
  quoteCurrencyPreference: QuoteCurrency;
  nonce?: number;
  inputCurrencyMode: InputCurrencyMode;
  selectingAsset: 'base' | 'target' | null;
  validation: [];
}

export interface SwapState extends SwapInternalState {
  secondaryAmount: SecondaryAmount;
  assetFlippingAllowed: boolean;
}

export type SwapActionObject =
  | { type: 'SET_BASE_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'SET_TARGET_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'CLEAR_ASSET_SELECTION' }
  | { type: 'FLIP_ASSETS' }
  | { type: 'RECONCILE_BASE_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'RECONCILE_TARGET_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'SET_BASE_AMOUNT'; payload: string }
  | { type: 'TOGGLE_INPUT_CURRENCY_MODE'; payload: { nextBaseAmount: string } }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'TOGGLE_SLIPPAGE_EDITING'; payload: boolean }
  | { type: 'SET_NONCE'; payload: number }
  | { type: 'OPEN_ASSET_SELECTOR'; payload: 'base' | 'target' }
  | { type: 'CLOSE_ASSET_SELECTOR' };

export interface SwapActions {
  setBaseSwapAsset: (asset: AccountSwapAsset) => void;
  setTargetSwapAsset: (asset: AccountSwapAsset) => void;
  setBaseAmount: (amount: string) => void;
  toggleInputCurrencyMode: () => void;
  setSlippage: (slippage: number) => void;
  toggleSlippageEditing: (enabled: boolean) => void;
  setNonce: (nonce: number) => void;
  clearAssetSelection: () => void;
  flipAssets: () => void;
  openAssetSelector: (target: 'base' | 'target') => void;
  closeAssetSelector: () => void;
}

export interface UseSwapStateResult {
  state: SwapState;
  actions: SwapActions;
  baseAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  targetAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
}

export type SecondaryAmount =
  | { status: 'idle'; value: null }
  | { status: 'pending'; value: null }
  | { status: 'error'; value: null }
  | { status: 'success'; value: Money; isFetching: boolean };
