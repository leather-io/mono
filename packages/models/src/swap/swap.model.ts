import { CryptoAssetId } from '../assets/asset-id.model';
import { NativeCryptoAsset, Sip10Asset } from '../assets/asset.model';
import { Money } from '../money.model';
import type { StacksProtocol } from '../protocols/stacks-protocol.model';

export type SwappableFungibleCryptoAsset = NativeCryptoAsset | Sip10Asset;

export interface SwapAsset {
  readonly asset: SwappableFungibleCryptoAsset;
  readonly providerAssets: SwapProviderAsset[];
}

export const swapProviderIds = [
  'bitflow-sdk',
  'bitflow-bff-api',
  'sbtc-bridge',
  'alex-sdk',
  'velar-sdk',
] as const;
export type SwapProviderId = (typeof swapProviderIds)[number];

export interface SwapProvider {
  readonly id: SwapProviderId;
  readonly isAggregator: boolean;
}

export interface SwapProviderAsset {
  readonly providerId: SwapProviderId;
  readonly providerAssetId: string;
  readonly assetId: CryptoAssetId;
}

export type SwapQuote =
  | AlexSdkSwapQuote
  | VelarSdkSwapQuote
  | BitflowSdkSwapQuote
  | BitflowBffApiSwapQuote
  | SbtcBridgeSwapQuote;

export interface BaseSwapQuote {
  readonly executionType: SwapExecutionType;
  readonly providerId: SwapProviderId;
  readonly baseAsset: SwappableFungibleCryptoAsset;
  readonly targetAsset: SwappableFungibleCryptoAsset;
  readonly baseAmount: Money;
  readonly targetAmount: Money;
  readonly dexPath: StacksProtocol[];
  readonly assetPath: (NativeCryptoAsset | Sip10Asset)[];
  readonly isExecutable: boolean;
  readonly executionConstraints: ExecutionConstraint[];
  readonly createdAt: Date;
}

export interface ExecutionConstraint {
  readonly reason: 'minimum-threshold-not-met' | 'maximum-threshold-exceeded';
  readonly threshold: Money;
}

export interface AlexSdkSwapQuote extends BaseSwapQuote {
  readonly providerId: 'alex-sdk';
  readonly providerQuoteData: {
    baseProviderAssetId: string;
    targetProviderAssetId: string;
    alexSdkAmmRoute: unknown;
  };
}

export interface VelarSdkSwapQuote extends BaseSwapQuote {
  readonly providerId: 'velar-sdk';
  providerQuoteData: {
    readonly baseProviderAssetId: string;
    readonly targetProviderAssetId: string;
  };
}

export interface BitflowSdkSwapQuote extends BaseSwapQuote {
  readonly providerId: 'bitflow-sdk';
  readonly providerQuoteData: {
    bitflowSdkSelectedSwapRoute: unknown;
  };
}

export interface BitflowBffApiSwapQuote extends BaseSwapQuote {
  readonly providerId: 'bitflow-bff-api';
  readonly providerQuoteData: {
    bitflowBffApiQuote: unknown;
  };
}
export interface SbtcBridgeSwapQuote extends BaseSwapQuote {
  readonly providerId: 'sbtc-bridge';
  readonly providerQuoteData: {
    signerSweepTxFeeSats: number;
  };
}

export const swapExecutionTypes = ['stacks-contract-call', 'sbtc-bridge-deposit'] as const;
export type SwapExecutionType = (typeof swapExecutionTypes)[number];

export interface BaseSwapExecutionData {
  readonly executionType: SwapExecutionType;
  readonly providerId: SwapProviderId;
  readonly quote: SwapQuote;
}
export interface StacksContractCallSwapExecutionData extends BaseSwapExecutionData {
  readonly executionType: 'stacks-contract-call';
  readonly contractAddress: string;
  readonly contractName: string;
  readonly functionName: string;
  readonly functionArgs: unknown[];
  readonly postConditions: unknown[];
  readonly postConditionMode?: unknown;
}
export interface SbtcBridgeDepositSwapExecutionData extends BaseSwapExecutionData {
  readonly executionType: 'sbtc-bridge-deposit';
}
export type SwapExecutionData =
  | StacksContractCallSwapExecutionData
  | SbtcBridgeDepositSwapExecutionData;
