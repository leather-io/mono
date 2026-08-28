/* eslint-disable func-style */
import axios from 'axios';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import type { ApiRequestOptions } from '../types';
import {
  type EmilyDepositRequest,
  type EmilySbtcLimitsResponse,
  emilySbtcLimitsResponseSchema,
} from './emily-api.types';
import { getEmilyApiUrl } from './emily-api.utils';

const emilyNotifyDepositTimeoutMs = 10_000;

@injectable()
export class EmilyApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService
  ) {}

  private getBaseUrl() {
    return getEmilyApiUrl(selectBitcoinNetworkMode(this.settingsService.getSettings()));
  }

  public async getSbtcLimits({
    signal,
    skipCache,
  }: ApiRequestOptions = {}): Promise<EmilySbtcLimitsResponse> {
    const baseUrl = this.getBaseUrl();

    const fetchLimits = async (requestSignal?: AbortSignal) => {
      const response = await axios.get<EmilySbtcLimitsResponse>(`${baseUrl}/limits`, {
        signal: requestSignal,
      });
      return emilySbtcLimitsResponseSchema.parse(response.data);
    };

    return skipCache
      ? await fetchLimits(signal)
      : await this.cacheService.fetchWithCache(['emily-api-get-sbtc-limits', baseUrl], () =>
          fetchLimits()
        );
  }

  public async notifyDeposit(
    request: EmilyDepositRequest,
    { signal }: ApiRequestOptions = {}
  ): Promise<void> {
    await axios.post(`${this.getBaseUrl()}/deposit`, request, {
      signal,
      timeout: emilyNotifyDepositTimeoutMs,
    });
  }
}
