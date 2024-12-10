import { Sip10CryptoAssetInfo } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip10CryptoAssetInfo,
  getContractPrincipalFromAssetIdentifier,
} from './sip10-tokens.utils';

export interface Sip10TokensService {
  getInfo(assetIdentifier: string, signal?: AbortSignal): Promise<Sip10CryptoAssetInfo>;
}

export function createSip10TokensService(stacksApiClient: HiroStacksApiClient): Sip10TokensService {
  /**
   * Gets full asset information for given SIP10 asset identifier. Asset indentifier expected format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  async function getInfo(assetIdentifier: string, signal?: AbortSignal) {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const metadata = await stacksApiClient.getFungibleTokenMetadata(principal, signal);
    return createSip10CryptoAssetInfo(assetIdentifier, metadata);
  }
  return {
    getInfo,
  };
}
