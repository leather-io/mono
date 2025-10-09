import { ValidationResult } from '@/features/swap/swap-state/validation/swap-validation';
import { InputCurrencyMode } from '@/utils/types';
import { UseQueryResult } from '@tanstack/react-query';

import {
  Money,
  QuoteCurrency,
  SwapDex,
  SwapProviderId,
  SwapQuote,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export type PresetPercentage = 0.25 | 0.5 | 0.75 | 1;

export type SwapQuoteStrategy = 'best' | 'fastest' | 'cheapest';

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
  quoteStrategy: SwapQuoteStrategy;
  nonce?: number;
  inputCurrencyMode: InputCurrencyMode;
  selectingAsset: 'base' | 'target' | null;
}

export interface SwapState extends SwapInternalState {
  secondaryAmount: SecondaryAmount;
  assetFlippingAllowed: boolean;
  isSendingMax: boolean;
}

export type SwapActionObject =
  | { type: 'SET_BASE_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'SET_TARGET_SWAP_ASSET'; payload: AccountSwapAsset }
  | { type: 'CLEAR_ASSET_SELECTION' }
  | { type: 'FLIP_ASSETS' }
  | { type: 'RECONCILE_BASE_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'RECONCILE_TARGET_WITH_PROVIDER'; payload: AccountSwapAsset[] }
  | { type: 'SET_BASE_AMOUNT'; payload: string }
  | { type: 'SET_BASE_AMOUNT_BY_PERCENTAGE'; payload: PresetPercentage }
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
  setBaseAmountByPercentage: (percentage: PresetPercentage) => void;
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
  validation: ValidationResult;
  baseAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  targetAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
}

export type SecondaryAmount =
  | { status: 'idle'; value: null }
  | { status: 'pending'; value: null }
  | { status: 'error'; value: null }
  | { status: 'success'; value: Money; isFetching: boolean };

export interface EnrichedSwapQuote {
  rawSwapQuote: SwapQuote;
  rate: number;
  dexPath: SwapDex[];
  assetPath: SwappableFungibleCryptoAsset[];
  quoteAmount: Money;
  minReceive?: Money;
  provider: SwapProviderId;
  providerFee?: number;
  score: number;
  priceImpactPercentage: number | null;
}

export interface SwapQuoteSelectionResult {
  quotes: EnrichedSwapQuote[];
  selected: EnrichedSwapQuote | undefined;
}
