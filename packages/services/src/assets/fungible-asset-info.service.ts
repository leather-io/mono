import { injectable } from 'inversify';

import { CryptoAssetProtocols, FungibleCryptoAsset } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import {
  LeatherApiClient,
  LeatherApiLocale,
} from '../infrastructure/api/leather/leather-api.client';
import { AssetDescription } from '../types/asset.types';

@injectable()
export class FungibleAssetInfoService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  public async getAssetDescription(
    asset: FungibleCryptoAsset,
    locale: LeatherApiLocale,
    signal?: AbortSignal
  ): Promise<AssetDescription> {
    switch (asset.protocol) {
      case CryptoAssetProtocols.nativeBtc:
      case CryptoAssetProtocols.nativeStx:
        return await this.leatherApiClient.fetchNativeTokenDescription(asset.symbol, locale, {
          signal,
        });
      case CryptoAssetProtocols.sip10:
        return await this.leatherApiClient.fetchSip10TokenDescription(asset.contractId, locale, {
          signal,
        });
      default:
        return assertUnreachable(asset);
    }
  }
}
