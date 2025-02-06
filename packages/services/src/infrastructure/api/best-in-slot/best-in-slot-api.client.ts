import axios from 'axios';
import { z } from 'zod';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { SettingsService } from '../../settings/settings.service';
import {
  bisBrc20MarketInfoSchema,
  bisInscriptionSchema,
  bisRuneTickerInfoSchema,
  bisRuneValidOutputsSchema,
} from './best-in-slot-api.schema';
import { getBestInSlotBasePath } from './best-in-slot-api.utils';

interface BestInSlotApiResponse<T> {
  block_height: number;
  data: T;
}

export type BisRuneTickerInfo = z.infer<typeof bisRuneTickerInfoSchema>;
export type BisBrc20MarketInfo = z.infer<typeof bisBrc20MarketInfoSchema>;
export type BisInscription = z.infer<typeof bisInscriptionSchema>;
export type BisRuneValidOutput = z.infer<typeof bisRuneValidOutputsSchema>;

export interface BestInSlotApiClient {
  fetchBrc20MarketInfo(ticker: string, signal?: AbortSignal): Promise<BisBrc20MarketInfo>;
  fetchRuneTickerInfo(runeName: string, signal?: AbortSignal): Promise<BisRuneTickerInfo>;
  fetchInscriptions(descriptor: string, signal?: AbortSignal): Promise<BisInscription[]>;
  fetchRunesValidOutputs(descriptor: string, signal?: AbortSignal): Promise<BisRuneValidOutput[]>;
}

export function createBestInSlotApiClient(
  settingsService: SettingsService,
  limiter: RateLimiterService,
  cache: HttpCacheService
): BestInSlotApiClient {
  async function fetchBrc20MarketInfo(ticker: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      [
        'best-in-slot-brc20-market-info',
        bitcoinNetworkModeToCoreNetworkMode(
          settingsService.getSettings().network.chain.bitcoin.mode
        ),
        ticker,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get<BestInSlotApiResponse<BisBrc20MarketInfo>>(
              `${getBestInSlotBasePath(settingsService.getSettings().network.chain.bitcoin.mode)}/brc20/market_info?ticker=${ticker}`,
              { signal }
            ),
          { signal }
        );
        return bisBrc20MarketInfoSchema.parse(res.data.data);
      },
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
  }

  async function fetchRuneTickerInfo(runeName: string, signal?: AbortSignal) {
    return await cache.fetchWithCache(
      [
        'best-in-slot-rune-ticker-info',
        bitcoinNetworkModeToCoreNetworkMode(
          settingsService.getSettings().network.chain.bitcoin.mode
        ),
        runeName,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get<BestInSlotApiResponse<BisRuneTickerInfo>>(
              `${getBestInSlotBasePath(settingsService.getSettings().network.chain.bitcoin.mode)}/runes/ticker_info?rune_name=${runeName}`,
              { signal }
            ),
          { signal }
        );
        return bisRuneTickerInfoSchema.parse(res.data.data);
      },
      { ttl: HttpCacheTimeMs.oneMonth }
    );
  }

  async function fetchInscriptions(descriptor: string, signal?: AbortSignal) {
    const params = new URLSearchParams();
    params.append('sort_by', 'inscr_num');
    params.append('order', 'desc');
    params.append('exclude_brc20', 'false');
    params.append('xpub', descriptor);
    params.append('offset', '0');
    params.append('count', '2000');

    return bitcoinNetworkModeToCoreNetworkMode(
      settingsService.getSettings().network.chain.bitcoin.mode
    ) !== 'mainnet'
      ? []
      : await cache.fetchWithCache(
          [
            'best-in-slot-inscriptions',
            bitcoinNetworkModeToCoreNetworkMode(
              settingsService.getSettings().network.chain.bitcoin.mode
            ),
            descriptor,
          ],
          async () => {
            const res = await limiter.add(
              RateLimiterType.BestInSlot,
              () =>
                axios.get<BestInSlotApiResponse<BisInscription[]>>(
                  `${getBestInSlotBasePath(settingsService.getSettings().network.chain.bitcoin.mode)}/wallet/inscriptions_xpub`,
                  { params, signal }
                ),
              { signal }
            );
            return z.array(bisInscriptionSchema).parse(res.data.data);
          },
          { ttl: HttpCacheTimeMs.twoMinutes }
        );
  }

  async function fetchRunesValidOutputs(descriptor: string, signal?: AbortSignal) {
    const params = new URLSearchParams();
    params.append('sort_by', 'output');
    params.append('order', 'desc');
    params.append('xpub', descriptor);
    params.append('offset', '0');
    params.append('count', '2000');

    return await cache.fetchWithCache(
      [
        'best-in-slot-runes-valid-outputs',
        bitcoinNetworkModeToCoreNetworkMode(
          settingsService.getSettings().network.chain.bitcoin.mode
        ),
        descriptor,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get<BestInSlotApiResponse<BisRuneValidOutput[]>>(
              `${getBestInSlotBasePath(settingsService.getSettings().network.chain.bitcoin.mode)}/runes/wallet_valid_outputs_xpub`,
              { params, signal }
            ),
          { signal }
        );
        return z.array(bisRuneValidOutputsSchema).parse(res.data.data);
      },
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
  }

  return {
    fetchBrc20MarketInfo,
    fetchRuneTickerInfo,
    fetchInscriptions,
    fetchRunesValidOutputs,
  };
}
