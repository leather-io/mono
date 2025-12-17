import { injectable } from 'inversify';

import { Sip9Asset } from '@leather.io/models';

import {
  GammaApiClient,
  type GammaNftMetadata,
} from '../infrastructure/api/gamma/gamma-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import type { HiroMetadata } from '../infrastructure/api/hiro/hiro-stacks-api.types';
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

    const hiroMetadata: HiroMetadata | undefined =
      hiroResult.status === 'fulfilled' && hiroResult.value ? hiroResult.value : undefined;

    const gammaMetadata: GammaNftMetadata | null =
      gammaResult.status === 'fulfilled' ? gammaResult.value : null;

    return createSip9Asset(assetIdentifier, tokenId, hiroMetadata, gammaMetadata);
  }
}
