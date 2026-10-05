import { inject, injectable } from 'inversify';

import { FungibleAssetId, FungibleCryptoAsset } from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import {
  SerializedCryptoAssetId,
  getAssetId,
  isDefined,
  serializeAssetId,
} from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { AppConfigService } from '../infrastructure/app-config/app-config.service';
import { selectAssetVisibility } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';

export type DefaultAssetVisibilityPolicy =
  | { type: 'appConfig' }
  | { type: 'allowlist'; assets: SerializedCryptoAssetId[] };

@injectable()
export class FungibleAssetVisibilityService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.DefaultAssetVisibilityPolicy)
    private readonly defaultVisibilityPolicy: DefaultAssetVisibilityPolicy
  ) {}

  async isAssetVisible(asset: FungibleCryptoAsset, signal?: AbortSignal) {
    return await this.isAssetVisibleById(getAssetId(asset) as FungibleAssetId, signal);
  }

  async isAssetVisibleById(assetId: FungibleAssetId, signal?: AbortSignal) {
    if (assetId.protocol === 'nativeBtc' || assetId.protocol === 'nativeStx') {
      return true;
    }
    const userAssetVisibilitySettings = selectAssetVisibility(this.settingsService.getSettings());
    const assetVisibility = userAssetVisibilitySettings?.[serializeAssetId(assetId)];
    return isDefined(assetVisibility)
      ? assetVisibility
      : await this.getDefaultAssetVisibility(assetId, signal);
  }

  async getDefaultAssetVisibility(assetId: FungibleAssetId, signal?: AbortSignal) {
    if (this.defaultVisibilityPolicy.type === 'allowlist') {
      return this.defaultVisibilityPolicy.assets.includes(serializeAssetId(assetId));
    }
    const defaultAssets = await this.appConfigService.getDefaultEnabledAssets(signal);
    if (defaultAssets.includes(serializeAssetId(assetId))) {
      return true;
    } else if (assetId.protocol === 'sip10') {
      const sip10Prices = await this.leatherApiClient.fetchSip10PriceMap({ signal });
      return isDefined(sip10Prices[getPrincipalFromAssetString(assetId.id)]);
    } else {
      return false;
    }
  }
}
