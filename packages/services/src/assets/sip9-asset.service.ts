import { injectable } from 'inversify';

import { Sip9Asset } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { GammaApiClient } from '../infrastructure/api/gamma/gamma-api.client';
import {
  createSip9Asset,
  getContractPrincipalFromAssetIdentifier,
  getNonFungibleTokenId,
} from './stacks-asset.utils';

@injectable()
export class Sip9AssetService {
  constructor(private readonly stacksApiClient: HiroStacksApiClient, 
    private readonly gammaApiClient: GammaApiClient) {}
  /**
   * Gets full asset information for given SIP-9 asset identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  public async getAsset(
    assetIdentifier: string,
    tokenHexValue: string,
    signal?: AbortSignal
  ): Promise<Sip9Asset> {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const tokenId = getNonFungibleTokenId(tokenHexValue);
    const hiroMetadata = await this.stacksApiClient.getNftMetadata(principal, tokenId, { signal });
    const gammaMetadata = await this.gammaApiClient.getStacksNft(principal, tokenId, { signal });
    
    return createSip9Asset(assetIdentifier, tokenId, hiroMetadata, gammaMetadata);
  }
}
