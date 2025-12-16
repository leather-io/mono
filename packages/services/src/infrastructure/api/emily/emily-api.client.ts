/* eslint-disable func-style */
import axios from 'axios';
import { inject, injectable } from 'inversify';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import type { ApiRequestOptions } from '../types';
import {
  type EmilySbtcDepositsResponse,
  type EmilySbtcLimitsResponse,
  emilySbtcDepositsResponseSchema,
  emilySbtcLimitsResponseSchema,
  type EmilySbtcDepositStatus,
} from './emily-api.types';
import { getEmilyApiUrl } from './emily-api.utils';

@injectable()
export class EmilyApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService
  ) {}

  public async getSbtcLimits({
    signal,
    skipCache,
  }: ApiRequestOptions = {}): Promise<EmilySbtcLimitsResponse> {
    const baseUrl = getEmilyApiUrl(selectBitcoinNetworkMode(this.settingsService.getSettings()));

    const fetchFn = async () => {
      const response = await axios.get<EmilySbtcLimitsResponse>(`${baseUrl}/limits`, { signal });
      return emilySbtcLimitsResponseSchema.parse(response.data);
    };

    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(['emily-api-get-sbtc-limits'], fetchFn);
  }

  public async getSbtcDeposits(
    status: EmilySbtcDepositStatus,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<EmilySbtcDepositsResponse> {
    const baseUrl = getEmilyApiUrl(selectBitcoinNetworkMode(this.settingsService.getSettings()));

    const fetchFn = async () => {
      const response = await axios.get<EmilySbtcDepositsResponse>(`${baseUrl}/deposit`, {
        params: { status },
        signal,
      });
      return emilySbtcDepositsResponseSchema.parse(response.data);
    };

    return skipCache
      ? await fetchFn()
      : await this.cacheService.fetchWithCache(
          ['emily-api-get-sbtc-deposits', status],
          fetchFn
        );
  }
}
