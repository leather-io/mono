import { CryptoAssetId } from '../assets/asset-id.model';
import { NativeCryptoAsset, Sip10Asset } from '../assets/asset.model';
import { Money } from '../money.model';

export type SwappableFungibleCryptoAsset = NativeCryptoAsset | Sip10Asset;

export interface SwapAsset {
  asset: SwappableFungibleCryptoAsset;
  providerAssets: SwapProviderAsset[];
}

export const swapProviderIds = ['bitflow-sdk', 'sbtc-bridge', 'alex-sdk', 'velar-sdk'] as const;
export type SwapProviderId = (typeof swapProviderIds)[number];

export interface SwapProvider {
  id: SwapProviderId;
  isAggregator: boolean;
}

export interface SwapProviderAsset {
  providerId: SwapProviderId;
  providerAssetId: string;
  assetId: CryptoAssetId;
}

export type SwapQuote =
  | AlexSdkSwapQuote
  | VelarSdkSwapQuote
  | BitflowSdkSwapQuote
  | SbtcBridgeSwapQuote;

export interface BaseSwapQuote {
  executionType: SwapExecutionType;
  providerId: SwapProviderId;
  baseAsset: SwappableFungibleCryptoAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  baseAmount: Money;
  targetAmount: Money;
  dexPath: SwapDex[];
  assetPath: (NativeCryptoAsset | Sip10Asset)[];
  createdAt: Date;
}

export interface AlexSdkSwapQuote extends BaseSwapQuote {
  providerId: 'alex-sdk';
  providerQuoteData: {
    baseProviderAssetId: string;
    targetProviderAssetId: string;
    alexSdkAmmRoute: unknown;
  };
}

export interface VelarSdkSwapQuote extends BaseSwapQuote {
  providerId: 'velar-sdk';
  providerQuoteData: {
    baseProviderAssetId: string;
    targetProviderAssetId: string;
  };
}

export interface BitflowSdkSwapQuote extends BaseSwapQuote {
  providerId: 'bitflow-sdk';
  providerQuoteData: {
    bitflowSdkSelectedSwapRoute: unknown;
  };
}

export interface SbtcBridgeSwapQuote extends BaseSwapQuote {
  providerId: 'sbtc-bridge';
}

export interface SwapDex {
  name: string;
  url: string;
  logo: string;
  description: string;
}

export const swapExecutionTypes = ['stacks-contract-call', 'sbtc-bridge-transfer'] as const;
export type SwapExecutionType = (typeof swapExecutionTypes)[number];

export interface BaseSwapExecutionData {
  executionType: SwapExecutionType;
  providerId: SwapProviderId;
  quote: SwapQuote;
}
export interface StacksContractCallSwapExecutionData extends BaseSwapExecutionData {
  executionType: 'stacks-contract-call';
  quote: SwapQuote;
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: unknown[];
  postConditions: unknown[];
  postConditionMode?: unknown;
}
export interface SbtcBridgeTransferSwapExecutionData extends BaseSwapExecutionData {
  executionType: 'sbtc-bridge-transfer';
}
export type SwapExecutionData =
  | StacksContractCallSwapExecutionData
  | SbtcBridgeTransferSwapExecutionData;
