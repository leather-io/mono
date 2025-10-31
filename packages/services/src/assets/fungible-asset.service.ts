import { injectable } from 'inversify';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleAssetId, FungibleCryptoAsset } from '@leather.io/models';

import { RuneAssetService } from './rune-asset.service';
import { Sip10AssetService } from './sip10-asset.service';

@injectable()
export class FungibleAssetService {
  constructor(
    private readonly runeAssetService: RuneAssetService,
    private readonly sip10AssetService: Sip10AssetService
  ) {}

  public async getVisibleAsset(
    assetId: FungibleAssetId,
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset | null> {
    switch (assetId.protocol) {
      case 'nativeBtc':
        return btcAsset;
      case 'nativeStx':
        return stxAsset;
      case 'rune':
        return await this.runeAssetService.getVisibleAsset(assetId.id, signal);
      case 'sip10':
        return await this.sip10AssetService.getVisibleAsset(assetId.id, signal);
      default:
        throw new Error(`Asset not found: ${assetId.protocol}`);
    }
  }

  public async getAsset(
    assetId: FungibleAssetId,
    signal?: AbortSignal
  ): Promise<FungibleCryptoAsset> {
    switch (assetId.protocol) {
      case 'nativeBtc':
        return btcAsset;
      case 'nativeStx':
        return stxAsset;
      case 'rune':
        return await this.runeAssetService.getAsset(assetId.id, signal);
      case 'sip10':
        return await this.sip10AssetService.getAsset(assetId.id, signal);
      default:
        throw new Error(`Asset not found: ${assetId.protocol}`);
    }
  }
}
