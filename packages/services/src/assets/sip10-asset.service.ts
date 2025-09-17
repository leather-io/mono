import { injectable } from 'inversify';

import { Sip10Asset } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { FungibleAssetVisibilityService } from './fungible-asset-visibility.service';
import { createSip10Asset, getContractPrincipalFromAssetIdentifier } from './stacks-asset.utils';

@injectable()
export class Sip10AssetService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetVisibilityService: FungibleAssetVisibilityService
  ) {}
  /**
   * Gets full asset information for given SIP10 identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  public async getAsset(assetIdentifier: string, signal?: AbortSignal): Promise<Sip10Asset> {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    return this.getAssetByPrincipal(principal, signal);
  }

  public async getAssetByPrincipal(principal: string, signal?: AbortSignal): Promise<Sip10Asset> {
    const tokenMap = await this.leatherApiClient.fetchSip10TokenMap({ signal });
    const sip10Token = tokenMap[principal]
      ? { ...tokenMap[principal], principal }
      : await this.leatherApiClient.fetchSip10Token(principal, { signal });
    if (!sip10Token) throw new Error(`Sip10 Token Not Found: ${principal}`);
    return createSip10Asset(sip10Token);
  }

  /**
   * Returns the SIP-10 Asset if visible, otherwise returns null.
   */
  public async getVisibleAsset(
    assetIdentifier: string,
    signal?: AbortSignal
  ): Promise<Sip10Asset | null> {
    return (await this.fungibleAssetVisibilityService.isAssetVisibleById(
      { protocol: 'sip10', id: assetIdentifier },
      signal
    ))
      ? await this.getAsset(assetIdentifier, signal)
      : null;
  }
}
