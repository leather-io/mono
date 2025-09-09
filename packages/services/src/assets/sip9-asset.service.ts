import { injectable } from 'inversify';

import { Sip9Asset } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip9Asset,
  getContractPrincipalFromAssetIdentifier,
  getNonFungibleTokenId,
} from './stacks-asset.utils';

@injectable()
export class Sip9AssetService {
  constructor(private readonly stacksApiClient: HiroStacksApiClient) {}
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
    // PETE this is where we should get the gamma metadata
    const metadata = await this.stacksApiClient.getNftMetadata(principal, tokenId, { signal });
    if (!metadata) throw new Error(`Sip9 Metadata Not Found: ${assetIdentifier}`);
    // console.log('createSip9Asset', metadata);
    // if(metadata.metadata?.name === 'BNS - Archive') {
    //   console.log('metadata.metadata?.name', assetIdentifier);
    // }
    return createSip9Asset(assetIdentifier, tokenId, metadata);
  }
}
