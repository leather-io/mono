import { injectable } from 'inversify';

import { Sip10CryptoAssetInfo } from '@leather.io/models';

import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  createSip10CryptoAssetInfo,
  getContractPrincipalFromAssetIdentifier,
} from './stacks-asset.utils';

@injectable()
export class Sip10AssetService {
  constructor(private readonly stacksApiClient: HiroStacksApiClient) {}
  /**
   * Gets full asset information for given SIP10 identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  public async getAssetInfo(
    assetIdentifier: string,
    signal?: AbortSignal
  ): Promise<Sip10CryptoAssetInfo> {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const metadata = await this.stacksApiClient.getFungibleTokenMetadata(principal, signal);
    return createSip10CryptoAssetInfo(assetIdentifier, metadata);
  }
}
