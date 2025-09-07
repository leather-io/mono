/* eslint-disable */
import { baseAssetListing } from '@/features/swap/temp/base-swap-asset-listing';
import { targetAssetListingSBTC } from '@/features/swap/temp/target-asset-listing-sbtc';

import { CryptoAssetBalance, CryptoAssetId, FungibleCryptoAsset, Money } from '@leather.io/models';

export interface SwapAsset {
  asset: FungibleCryptoAsset;
  providerAssets: SwapProviderAsset[];
}

export interface AccountSwapAsset extends SwapAsset {
  balance?: {
    quote: CryptoAssetBalance;
    crypto: CryptoAssetBalance;
  };
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

export interface SwapQuote {
  executionType: SwapExecutionType;
  providerId: SwapProviderId;
  providerQuoteData: any;
  baseAmount: number;
  targetAmount: number;
  quote: Money;
  dexPath: SwapDex[];
  assetPath: FungibleCryptoAsset[];
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
  type: SwapExecutionType;
  providerId: SwapProviderId;
}
export interface StacksContractCallSwapExecutionData extends BaseSwapExecutionData {
  type: 'stacks-contract-call';
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  postConditions: any[];
  postConditionMode?: any;
}
export interface SbtcBridgeTransferSwapExecutionData extends BaseSwapExecutionData {
  type: 'sbtc-bridge-transfer';
}

export type SwapExecutionData =
  | StacksContractCallSwapExecutionData
  | SbtcBridgeTransferSwapExecutionData;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getAccountBaseSwapAssets(): Promise<AccountSwapAsset[]> {
  await sleep(500);
  return baseAssetListing;
}

export async function getAccountTargetSwapAssets(
  baseId: CryptoAssetId
): Promise<AccountSwapAsset[]> {
  await sleep(500);
  return targetAssetListingSBTC;
}
