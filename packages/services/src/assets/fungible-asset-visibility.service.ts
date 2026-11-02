import { inject, injectable } from 'inversify';

import { FungibleAssetId, FungibleCryptoAsset } from '@leather.io/models';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { isDefined, serializeAssetId } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { AppConfigService } from '../infrastructure/app-config/app-config.service';
import {
  selectAssetVisibility,
  selectDefaultAssetVisibility,
} from '../infrastructure/settings/settings.selectors';
import type {
  DefaultAssetVisibilityPolicy,
  SettingsService,
} from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { getFungibleAssetId } from './fungible-asset-id.utils';

@injectable()
export class FungibleAssetVisibilityService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly leatherApiClient: LeatherApiClient,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService
  ) {}

  async isAssetVisible(asset: FungibleCryptoAsset, signal?: AbortSignal) {
    return await this.isAssetVisibleById(getFungibleAssetId(asset), signal);
  }

  async isAssetVisibleById(assetId: FungibleAssetId, signal?: AbortSignal) {
    const policy = selectDefaultAssetVisibility(this.settingsService.getSettings());
    return await this.isAssetVisibleWithPolicy(assetId, policy, signal);
  }

  async isSwapAssetVisibleById(assetId: FungibleAssetId, signal?: AbortSignal) {
    return await this.isAssetVisibleWithPolicy(assetId, { type: 'appConfig' }, signal);
  }

  async getDefaultAssetVisibility(assetId: FungibleAssetId, signal?: AbortSignal) {
    const policy = selectDefaultAssetVisibility(this.settingsService.getSettings());
    return await this.getDefaultAssetVisibilityWithPolicy(assetId, policy, signal);
  }

  private async isAssetVisibleWithPolicy(
    assetId: FungibleAssetId,
    policy: DefaultAssetVisibilityPolicy,
    signal?: AbortSignal
  ) {
    if (assetId.protocol === 'nativeBtc' || assetId.protocol === 'nativeStx') {
      return true;
    }
    const userAssetVisibilitySettings = selectAssetVisibility(this.settingsService.getSettings());
    const assetVisibility = userAssetVisibilitySettings?.[serializeAssetId(assetId)];
    return isDefined(assetVisibility)
      ? assetVisibility
      : await this.getDefaultAssetVisibilityWithPolicy(assetId, policy, signal);
  }

  private async getDefaultAssetVisibilityWithPolicy(
    assetId: FungibleAssetId,
    policy: DefaultAssetVisibilityPolicy,
    signal?: AbortSignal
  ) {
    if (policy.type === 'allowlist') {
      return policy.assets.includes(serializeAssetId(assetId));
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
