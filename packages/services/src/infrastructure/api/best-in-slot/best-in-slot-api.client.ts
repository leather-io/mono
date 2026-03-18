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
import {
  bisBrc20MarketInfoSchema,
  bisInscriptionSchema,
  bisRuneValidOutputsSchema,
} from './best-in-slot-api.schema';
import { getBestInSlotBasePath } from './best-in-slot-api.utils';

interface BestInSlotApiResponse<T> {
  block_height: number;
  data: T;
}

export type BisBrc20MarketInfo = z.infer<typeof bisBrc20MarketInfoSchema>;
export type BisInscription = z.infer<typeof bisInscriptionSchema>;
export type BisRuneValidOutput = z.infer<typeof bisRuneValidOutputsSchema>;

const bisPageSize = 2000;

@injectable()
export class BestInSlotApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    private readonly limiter: RateLimiterService
  ) {}

  private async fetchPaginated<T>(
    url: string,
    baseParams: URLSearchParams,
    schema: z.ZodType<T>,
    signal?: AbortSignal
  ): Promise<T[]> {
    const results: T[] = [];
    let offset = 0;

    while (true) {
      const params = new URLSearchParams(baseParams);
      params.set('offset', String(offset));
      params.set('count', String(bisPageSize));

      const res = await this.limiter.add(
        RateLimiterType.BestInSlot,
        () => axios.get<BestInSlotApiResponse<T[]>>(url, { params, signal }),
        { signal }
      );

      const page = z.array(schema).parse(res.data.data);
      results.push(...page);

      if (page.length < bisPageSize) break;
      offset += bisPageSize;
    }

    return results;
  }

  public async fetchBrc20MarketInfo(
    ticker: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BisBrc20MarketInfo> {
    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );

    const fetchFn = async () => {
      const res = await this.limiter.add(
        RateLimiterType.BestInSlot,
        () =>
          axios.get<BestInSlotApiResponse<BisBrc20MarketInfo>>(
            `${getBestInSlotBasePath(network)}/brc20/market_info?ticker=${ticker}`,
            { signal }
          ),
        { signal }
      );
      return bisBrc20MarketInfoSchema.parse(res.data.data);
    };

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bis-brc20-market-info', network, ticker], fetchFn);
  }

  public async fetchInscriptions(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BisInscription[]> {
    const params = new URLSearchParams();
    params.append('sort_by', 'inscr_num');
    params.append('order', 'desc');
    params.append('exclude_brc20', 'false');
    params.append('xpub', descriptor);

    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );

    const url = `${getBestInSlotBasePath(network)}/wallet/inscriptions_xpub`;
    const fetchFn = () => this.fetchPaginated(url, params, bisInscriptionSchema, signal);

    if (network !== 'mainnet') {
      return [];
    }

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bis-inscriptions', network, descriptor], fetchFn);
  }

  public async fetchRunesValidOutputs(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BisRuneValidOutput[]> {
    const params = new URLSearchParams();
    params.append('sort_by', 'output');
    params.append('order', 'desc');
    params.append('xpub', descriptor);

    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );

    const url = `${getBestInSlotBasePath(network)}/runes/wallet_valid_outputs_xpub`;
    const fetchFn = () => this.fetchPaginated(url, params, bisRuneValidOutputsSchema, signal);

    if (network !== 'mainnet') {
      return [];
    }

    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['bis-runes-valid-outputs', network, descriptor], fetchFn);
  }
}
