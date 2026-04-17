import axios from 'axios';
import { inject, injectable } from 'inversify';
import { z } from 'zod';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { ApiRequestOptions } from '../types';
import { bisInscriptionSchema } from './best-in-slot-api.schema';
import { getBestInSlotBasePath } from './best-in-slot-api.utils';

interface BestInSlotApiResponse<T> {
  block_height: number;
  data: T;
}

export type BisInscription = z.infer<typeof bisInscriptionSchema>;

@injectable()
export class BestInSlotApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    private readonly limiter: RateLimiterService
  ) {}

  private async withFallback<T>(
    request: () => Promise<T>,
    fallbackValue: T,
    isFeatureActive?: boolean
  ): Promise<T> {
    if (isFeatureActive !== false) return request();
    try {
      return await request();
    } catch {
      return fallbackValue;
    }
  }

  public async fetchInscriptions(
    descriptor: string,
    { signal, skipCache, isOrdinalsActive }: ApiRequestOptions = {}
  ): Promise<BisInscription[]> {
    const params = new URLSearchParams();
    params.append('sort_by', 'inscr_num');
    params.append('order', 'desc');
    params.append('exclude_brc20', 'false');
    params.append('xpub', descriptor);
    params.append('offset', '0');
    params.append('count', '2000');

    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );

    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.BestInSlot,
        () =>
          axios.get<BestInSlotApiResponse<BisInscription[]>>(
            `${getBestInSlotBasePath(network)}/wallet/inscriptions_xpub`,
            { params, signal }
          ),
        { signal }
      );
      return z.array(bisInscriptionSchema).parse(res.data.data);
    };

    if (network !== 'mainnet') {
      return [];
    }

    const request = async () =>
      skipCache
        ? await fetchFn()
        : await this.cache.fetchWithCache(['bis-inscriptions', network, descriptor], fetchFn);

    return this.withFallback(request, [], isOrdinalsActive);
  }
}
