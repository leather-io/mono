import axios from 'axios';
import { inject, injectable } from 'inversify';
import { z } from 'zod';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
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

@injectable()
export class BestInSlotApiClient {
  constructor(
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    private readonly limiter: RateLimiterService
  ) {}

  public async fetchBrc20MarketInfo(
    ticker: string,
    signal?: AbortSignal
  ): Promise<BisBrc20MarketInfo> {
    const network = bitcoinNetworkModeToCoreNetworkMode(
      selectBitcoinNetworkMode(this.settingsService.getSettings())
    );
    return await this.cache.fetchWithCache(['bis-brc20-market-info', network, ticker], async () => {
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
    });
  }

  public async fetchInscriptions(
    descriptor: string,
    signal?: AbortSignal
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
    return network !== 'mainnet'
      ? []
      : await this.cache.fetchWithCache(['bis-inscriptions', network, descriptor], async () => {
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
        });
  }

  public async fetchRunesValidOutputs(
    descriptor: string,
    signal?: AbortSignal
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
    return network !== 'mainnet'
      ? []
      : await this.cache.fetchWithCache(
          ['bis-runes-valid-outputs', network, descriptor],
          async () => {
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
          }
        );
  }
}
