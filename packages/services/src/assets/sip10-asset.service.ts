import { injectable } from 'inversify';

import { Sip10CryptoAssetInfo } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  createSip10CryptoAssetInfo,
  getContractPrincipalFromAssetIdentifier,
} from './stacks-asset.utils';

@injectable()
export class Sip10AssetService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}
  /**
   * Gets full asset information for given SIP10 identifier.
   * Expected identifier format: \<address\>.\<contract-name\>::\<asset-name\>
   */
  public async getAssetInfo(
    assetIdentifier: string,
    signal?: AbortSignal
  ): Promise<Sip10CryptoAssetInfo> {
    const principal = getContractPrincipalFromAssetIdentifier(assetIdentifier);
    const tokenMap = await this.leatherApiClient.fetchSip10TokenMap(signal);
    const sip10Token = tokenMap[principal]
      ? { ...tokenMap[principal], principal }
      : await this.leatherApiClient.fetchSip10Token(principal, signal);
    if (!sip10Token) throw new Error(`Sip10 Token Not Found: ${assetIdentifier}`);
    return createSip10CryptoAssetInfo(sip10Token);
  }
}
