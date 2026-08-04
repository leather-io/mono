import type * as btc from '@scure/btc-signer';
import { type StacksNetwork } from '@stacks/network';
import { type StacksTransactionWire, type TxBroadcastResultOk } from '@stacks/transactions';
import { type UseQueryResult } from '@tanstack/react-query';
import type BigNumber from 'bignumber.js';
import type { SbtcApiClient } from 'sbtc';

import { type configureAnalyticsClient } from '@leather.io/analytics';
import { type BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import {
  type AccountAddresses,
  CryptoAssetId,
  type ExecutionConstraint,
  type InputCurrencyMode,
  type MarketData,
  type Money,
  type NetworkConfiguration,
  type QuoteCurrency,
  type StacksProtocol,
  type SwapExecutionData,
  type SwapProviderId,
  type SwapQuote,
  type SwappableFungibleCryptoAsset,
  type TransactionFeeQuote,
  type TransactionFeeTier,
} from '@leather.io/models';
import { type NextNonce } from '@leather.io/query';
import {
  type AccountSwapAsset,
  type BitcoinCoinSelectionService,
  type BitcoinTransactionFeesService,
  type MarketDataService,
  type StacksTransactionFeesService,
  type SwapService,
} from '@leather.io/services';
import { type StacksSigner } from '@leather.io/stacks';

import { type ValidationResult } from './validation/swap-validation.types';

export type TrackEvent = ReturnType<typeof configureAnalyticsClient>['track'];

export interface SwapDependencies {
  accountRequest: { account: AccountAddresses };
  stacks: {
    stacksSigner: StacksSigner;
    stacksNetwork: StacksNetwork;
    broadcast(params: {
      tx: StacksTransactionWire;
      stacksNetwork: StacksNetwork;
    }): Promise<TxBroadcastResultOk>;
    nextNonce: NextNonce | undefined;
  };
  bitcoin?: {
    bitcoinPayer: BitcoinNativeSegwitPayer;
    network: NetworkConfiguration;
    sbtcClient: SbtcApiClient;
    signBitcoinPsbt(psbt: Uint8Array): Promise<btc.Transaction>;
  };
  services: {
    marketDataService: MarketDataService;
    bitcoinTransactionFeesService: BitcoinTransactionFeesService;
    bitcoinCoinSelectionService: BitcoinCoinSelectionService;
    stacksTransactionFeesService: StacksTransactionFeesService;
    swapService: SwapService;
  };
  onSwapSubmitted?(result: SwapSubmissionResult): void;
}

export interface SwapExecutionDependencies extends SwapDependencies {
  derivedAmounts: DerivedAmounts;
  isSendingMax: boolean;
  executionData: SwapExecutionData;
  nonce?: number;
}

export type PresetPercentage = 0.25 | 0.5 | 0.75 | 1;

export type SwapQuotePolicy = 'best' | 'fastest' | 'cheapest';

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
  | { mode: 'fixed'; calculation: TransactionFeeQuote }
  | {
      mode: 'tiered';
      calculation: TransactionFeeQuote;
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

export interface DisabledPairRule {
  base: CryptoAssetId | '*';
  target: CryptoAssetId | '*';
}

export interface EnrichedSwapQuote {
  rawSwapQuote: SwapQuote;
  swapRate: BigNumber;
  dexPath: StacksProtocol[];
  assetPath: SwappableFungibleCryptoAsset[];
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  isExecutable: boolean;
  executionConstraints: ExecutionConstraint[];
  createdAt: Date;
  slippageApplicable: boolean;
  minReceive?: Money;
  provider: SwapProviderId;
  providerFeePercentage?: BigNumber;
  score: number;
  priceImpactPercentage: BigNumber | null;
}

export type SwapQuoteSelectionResult =
  | {
      quotes: EnrichedSwapQuote[];
      selected: EnrichedSwapQuote;
    }
  | {
      quotes: EnrichedSwapQuote[];
      selected: undefined;
      unmetConstraints: ExecutionConstraint[];
    };

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
  quotePolicy: SwapQuotePolicy;
  nonceOverride?: number;
  inputCurrencyMode: InputCurrencyMode;
  selectingAsset: 'base' | 'target' | null;
  feeTier: TransactionFeeTier;
  customFee: number | null;
}

export interface SwapState extends SwapInternalState {
  secondaryAmount: SecondaryAmount;
  assetFlippingAllowed: boolean;
  isSendingMax: boolean;
  effectiveNonce: number;
  isInputReady: boolean;
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
  | { type: 'SET_NONCE_OVERRIDE'; payload: number }
  | { type: 'OPEN_ASSET_SELECTOR'; payload: 'base' | 'target' }
  | { type: 'CLOSE_ASSET_SELECTOR' }
  | { type: 'SET_FEE_TIER'; payload: TransactionFeeTier }
  | { type: 'SET_CUSTOM_FEE'; payload: number };

export interface SwapActions {
  setBaseSwapAsset(asset: AccountSwapAsset): void;
  setTargetSwapAsset(asset: AccountSwapAsset): void;
  setBaseAmount(amount: string): void;
  setBaseAmountByPercentage(percentage: PresetPercentage): void;
  toggleInputCurrencyMode(): void;
  setSlippage(slippage: number): void;
  setNonceOverride(nonce: number): void;
  clearAssetSelection(): void;
  flipAssets(): void;
  openAssetSelector(target: 'base' | 'target'): void;
  closeAssetSelector(): void;
  setFeeTier(tier: TransactionFeeTier): void;
  setCustomFee(fee: number): void;
}

export interface SbtcNotificationFailure {
  errorMessage: string;
}

export interface SwapSubmissionResult {
  txid: string;
  sbtcNotificationFailure?: SbtcNotificationFailure;
}

export interface UseSwapStateResult {
  state: SwapState;
  actions: SwapActions;
  validation: ValidationResult;
  baseAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  targetAssetsQuery: UseQueryResult<AccountSwapAsset[], Error>;
  baseMarketDataQuery: UseQueryResult<MarketData, Error>;
  targetMarketDataQuery: UseQueryResult<MarketData, Error>;
  networkFeeAssetMarkedDataQuery: UseQueryResult<MarketData, Error>;
  spendableAmountQuery: UseQueryResult<Money | null, Error>;
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
  canSubmit: boolean;
  submit(): Promise<SwapSubmissionResult>;
}
