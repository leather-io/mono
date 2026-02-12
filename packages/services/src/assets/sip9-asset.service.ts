import { injectable } from 'inversify';

import { Sip9Asset } from '@leather.io/models';

import { GammaApiClient } from '../infrastructure/api/gamma/gamma-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { createSip9Asset, getNonFungibleTokenId } from './sip9-asset.utils';
import { getContractPrincipalFromAssetIdentifier } from './stacks-asset.utils';

@injectable()
export class Sip9AssetService {
  constructor(
    private readonly stacksApiClient: HiroStacksApiClient,
    private readonly gammaApiClient: GammaApiClient
  ) {}
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

    const [hiroResult, gammaResult] = await Promise.allSettled([
      this.stacksApiClient.getNftMetadata(principal, tokenId, { signal }),
      this.gammaApiClient.getStacksNft(principal, tokenId, { signal }),
    ]);

    const hiroMetadata = hiroResult.status === 'fulfilled' ? hiroResult.value : null;
    const gammaMetadata = gammaResult.status === 'fulfilled' ? gammaResult.value : null;

    // eslint-disable-next-line no-console
    console.log('[DEBUG] SIP-9 metadata:', {
      assetIdentifier,
      tokenId,
      hiroStatus: hiroResult.status,
      gammaStatus: gammaResult.status,
      hiroImage: hiroMetadata?.cached_image || hiroMetadata?.image,
      gammaContentUrl: gammaMetadata?.item?.asset_content?.content_url,
    });

    return createSip9Asset(assetIdentifier, tokenId, hiroMetadata, gammaMetadata);
  }
}
