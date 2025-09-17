import { injectable } from 'inversify';

import { LeatherApiClient } from '../api/leather/leather-api.client';

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
}
