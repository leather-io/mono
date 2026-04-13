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

type BisBrc20MarketInfo = z.infer<typeof bisBrc20MarketInfoSchema>;
export type BisInscription = z.infer<typeof bisInscriptionSchema>;
export type BisRuneValidOutput = z.infer<typeof bisRuneValidOutputsSchema>;

const emptyBisBrc20MarketInfo: BisBrc20MarketInfo = {
  marketcap: 0,
  min_listed_unit_price: 0,
  min_listed_unit_price_ordinalswallet: 0,
  min_listed_unit_price_unisat: 0,
  min_listed_unit_price_okx: 0,
  listed_supply: 0,
  listed_supply_ratio: 0,
};

@injectable()
export class BestInSlotApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    private readonly limiter: RateLimiterService
  ) {}

  private async withFallback<T>(request: () => Promise<T>, fallbackValue: T): Promise<T> {
    try {
      return await request();
    } catch {
      return fallbackValue;
    }
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

    const request = async () =>
      skipCache
        ? await fetchFn()
        : await this.cache.fetchWithCache(['bis-brc20-market-info', network, ticker], fetchFn);

    return this.withFallback(request, emptyBisBrc20MarketInfo);
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

    return this.withFallback(request, []);
  }

  public async fetchRunesValidOutputs(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<BisRuneValidOutput[]> {
    const params = new URLSearchParams();
    params.append('sort_by', 'output');
    params.append('order', 'desc');
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
          axios.get<BestInSlotApiResponse<BisRuneValidOutput[]>>(
            `${getBestInSlotBasePath(network)}/runes/wallet_valid_outputs_xpub`,
            { params, signal }
          ),
        { signal }
      );
      return z.array(bisRuneValidOutputsSchema).parse(res.data.data);
    };

    if (network !== 'mainnet') {
      return [];
    }

    const request = async () =>
      skipCache
        ? await fetchFn()
        : await this.cache.fetchWithCache(
            ['bis-runes-valid-outputs', network, descriptor],
            fetchFn
          );

    return this.withFallback(request, []);
  }
}
