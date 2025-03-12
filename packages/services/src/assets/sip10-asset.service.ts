import { Sip10CryptoAssetInfo } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip10CryptoAssetInfo,
  getContractPrincipalFromAssetIdentifier,
} from './stacks-asset.utils';

export interface Sip10AssetService {
  getAssetInfo(assetIdentifier: string, signal?: AbortSignal): Promise<Sip10CryptoAssetInfo>;
}

export function createSip10AssetService(stacksApiClient: HiroStacksApiClient): Sip10AssetService {
  /**
   * Gets full asset information for given SIP10 identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  async function getAssetInfo(assetIdentifier: string, signal?: AbortSignal) {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const metadata = await stacksApiClient.getFungibleTokenMetadata(principal, signal);

    return createSip10CryptoAssetInfo(assetIdentifier, metadata);
  }
  return {
    getAssetInfo,
  };
}
