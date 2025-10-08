import {
  FungibleCryptoAsset,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwapQuote,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';

import { AccountRequest } from '../types';

export interface SwapProviderServiceGetTargetAssetParams {
  baseAsset: FungibleCryptoAsset;
  baseProviderAsset: SwapProviderAsset;
}

export interface SwapProviderServiceGetSwapQuotesParams {
  baseAsset: SwappableFungibleCryptoAsset;
  baseProviderAsset: SwapProviderAsset;
  targetAsset: SwappableFungibleCryptoAsset;
  targetProviderAsset: SwapProviderAsset;
  baseAmount: number;
}

export interface SwapProviderServiceGetSwapExecutionDataParams {
  request: AccountRequest;
  quote: SwapQuote;
  slippage: number;
}

export interface SwapProviderService {
  providerId: SwapProviderId;
  getBaseSwapAssets(signal?: AbortSignal): Promise<SwapProviderAsset[]>;
  getTargetAssets(
    params: SwapProviderServiceGetTargetAssetParams,
    signal?: AbortSignal
  ): Promise<SwapProviderAsset[]>;
  getSwapQuotes(
    params: SwapProviderServiceGetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<SwapQuote[]>;
  getSwapExecutionData(
    params: SwapProviderServiceGetSwapExecutionDataParams,
    signal?: AbortSignal
  ): Promise<SwapExecutionData>;
}
