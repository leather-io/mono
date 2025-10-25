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
  TransactionFeeQuote,
  TransactionFeeTier,
} from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

export type PresetPercentage = 0.25 | 0.5 | 0.75 | 1;

export type SwapQuoteStrategy = 'best' | 'fastest' | 'cheapest';

export type FeeMode = 'fixed' | 'tiered';

export interface FeeOption {
  tier: TransactionFeeTier;
  calculation: TransactionFeeQuote;
  value: Money;
}

export type FeeSelection =
  | { type: 'tiered'; tier: TransactionFeeTier }
  | { type: 'custom'; value: number };

export type NetworkFee =
  | { mode: 'fixed'; value: Money }
  | {
      mode: 'tiered';
      value: Money;
      options: FeeOption[];
      selected: FeeSelection;
      customFeeEnabled: boolean;
    };

export interface DerivedAmounts {
  crypto: Money | null;
  quote: Money | null;
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
  slippageApplicable: boolean;
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

export interface SwapInternalState {
  baseSwapAsset: AccountSwapAsset | null;
  targetSwapAsset: AccountSwapAsset | null;
  pairReconciliation: {
    base: 'pending' | 'complete';
    target: 'pending' | 'complete';
  };
  baseAmount: string;
  slippage: number;
  quoteCurrencyPreference: QuoteCurrency;
  quoteStrategy: SwapQuoteStrategy;
  nonce?: number;
  inputCurrencyMode: InputCurrencyMode;
  selectingAsset: 'base' | 'target' | null;
  feeTier: TransactionFeeTier;
  customFee: number | null;
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
  | { type: 'TOGGLE_INPUT_CURRENCY_MODE'; payload: { nextBaseAmount: string } }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'SET_NONCE'; payload: number }
  | { type: 'OPEN_ASSET_SELECTOR'; payload: 'base' | 'target' }
  | { type: 'CLOSE_ASSET_SELECTOR' }
  | { type: 'SET_FEE_TIER'; payload: TransactionFeeTier }
  | { type: 'SET_CUSTOM_FEE'; payload: number };

export interface SwapActions {
  setBaseSwapAsset: (asset: AccountSwapAsset) => void;
  setTargetSwapAsset: (asset: AccountSwapAsset) => void;
  setBaseAmount: (amount: string) => void;
  setBaseAmountByPercentage: (percentage: PresetPercentage) => void;
  toggleInputCurrencyMode: () => void;
  setSlippage: (slippage: number) => void;
  setNonce: (nonce: number) => void;
  clearAssetSelection: () => void;
  flipAssets: () => void;
  openAssetSelector: (target: 'base' | 'target') => void;
  closeAssetSelector: () => void;
  setFeeTier: (tier: TransactionFeeTier) => void;
  setCustomFee: (fee: number) => void;
}

export interface UseSwapStateResult {
  state: SwapState;
  actions: SwapActions;
  validation: ValidationResult;
  baseAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  targetAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  isSwapExecutable: boolean;
}
