import { Sip9CryptoAssetInfo } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip9CryptoAssetInfo,
  getContractPrincipalFromAssetIdentifier,
  getNonFungibleTokenId,
} from './stacks-asset.utils';

export interface Sip9AssetService {
  getAssetInfo(
    assetIdentifier: string,
    tokenHexValue: string,
    signal?: AbortSignal
  ): Promise<Sip9CryptoAssetInfo>;
}

export function createSip9AssetService(stacksApiClient: HiroStacksApiClient): Sip9AssetService {
  /**
   * Gets full asset information for given SIP-9 asset identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  async function getAssetInfo(
    assetIdentifier: string,
    tokenHexValue: string,
    signal?: AbortSignal
  ) {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const tokenId = getNonFungibleTokenId(tokenHexValue);
    const metadata = await stacksApiClient.getNonFungibleTokenMetadata(principal, tokenId, signal);
    return createSip9CryptoAssetInfo(assetIdentifier, tokenId, metadata);
  }
  return {
    getAssetInfo,
  };
}
