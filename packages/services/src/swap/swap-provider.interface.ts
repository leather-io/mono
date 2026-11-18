import type BigNumber from 'bignumber.js';

import {
  type FungibleCryptoAsset,
  type Money,
  type SwapExecutionData,
  type SwapProviderAsset,
  type SwapProviderId,
  type SwapQuote,
  type SwappableFungibleCryptoAsset,
} from '@leather.io/models';

import { type AccountRequest } from '../types';

export interface GetTargetProviderAssetsParams {
  baseAsset: FungibleCryptoAsset;
  baseProviderAsset: SwapProviderAsset;
}

export interface GetSwapQuotesParams {
  baseAsset: SwappableFungibleCryptoAsset;
  baseProviderAsset: SwapProviderAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  targetProviderAsset: SwapProviderAsset;
  baseAmount: Money;
}

export interface GetSwapExecutionDataParams {
  request: AccountRequest;
  quote: SwapQuote;
  slippagePercentage: BigNumber;
}

export interface SwapProviderService {
  providerId: SwapProviderId;
  getBaseProviderAssets(signal?: AbortSignal): Promise<SwapProviderAsset[]>;
  getTargetProviderAssets(
    params: GetTargetProviderAssetsParams,
    signal?: AbortSignal
  ): Promise<SwapProviderAsset[]>;
  getSwapQuotes(params: GetSwapQuotesParams, signal?: AbortSignal): Promise<SwapQuote[]>;
  getSwapExecutionData(
    params: GetSwapExecutionDataParams,
    signal?: AbortSignal
  ): Promise<SwapExecutionData>;
}
