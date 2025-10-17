import { injectable } from 'inversify';

import { LeatherApiAppConfig, LeatherApiClient } from '../api/leather/leather-api.client';

export type StacksFeeConfig = LeatherApiAppConfig['fees']['stacks'];

@injectable()
export class AppConfigService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  async getAppConfig(signal?: AbortSignal) {
    return this.leatherApiClient.fetchAppConfig({ signal });
  }

  async getDefaultEnabledAssets(signal?: AbortSignal) {
    const appConfig = await this.getAppConfig(signal);
    return appConfig.assets.defaultEnabled;
  }

  async getStacksTransactionFeeConfig(signal?: AbortSignal): Promise<StacksFeeConfig> {
    const appConfig = await this.getAppConfig(signal);
    return appConfig.fees.stacks;
  }
}
