import axios from 'axios';
import { z } from 'zod';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { NetworkSettingsService } from '../../settings/network-settings.service';
import { runeTickerInfoSchema } from './best-in-slot-api.schemas';
import { getBestInSlotBasePath } from './best-in-slot-api.utils';

interface BestInSlotApiResponse<T> {
  block_height: number;
  data: T;
}

export type BestInSlotRuneTickerInfo = z.infer<typeof runeTickerInfoSchema>;

export interface BestInSlotBrc20TickerInfo {
  id: string;
  number: number;
  block_height: number;
  tx_id: string;
  address: string;
  ticker: string;
  max_supply: string;
  mint_limit: string;
  decimals: number;
  deploy_timestamp: number;
  minted_supply: string;
  tx_count: number;
}

export interface BestInSlotBrc20MarketInfo {
  marketcap: number;
  min_listed_unit_price: number;
  min_listed_unit_price_ordinalswallet: number;
  min_listed_unit_price_unisat: number;
  min_listed_unit_price_okx: number;
  listed_supply: number;
  listed_supply_ratio: number;
}

export interface BestInSlotApiClient {
  fetchBrc20TickerInfo(ticker: string, signal?: AbortSignal): Promise<BestInSlotBrc20TickerInfo>;
  fetchBrc20MarketInfo(ticker: string, signal?: AbortSignal): Promise<BestInSlotBrc20MarketInfo>;
  fetchRuneTickerInfo(runeName: string, signal?: AbortSignal): Promise<BestInSlotRuneTickerInfo>;
}

export function createBestInSlotApiClient(
  networkService: NetworkSettingsService,
  limiter: RateLimiterService,
  cache: HttpCacheService
): BestInSlotApiClient {
  async function fetchBrc20TickerInfo(ticker: string, signal?: AbortSignal) {
    const response = await cache.fetchWithCache<BestInSlotApiResponse<BestInSlotBrc20TickerInfo>>(
      [
        'best-in-slot-brc20-ticker-info',
        bitcoinNetworkModeToCoreNetworkMode(networkService.getConfig().chain.bitcoin.mode),
        ticker,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get(
              `${getBestInSlotBasePath(networkService.getConfig().chain.bitcoin.mode)}/brc20/ticker_info?ticker=${ticker}`,
              { signal }
            ),
          { signal }
        );
        return res?.data;
      },
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
    return response.data;
  }

  async function fetchBrc20MarketInfo(ticker: string, signal?: AbortSignal) {
    const response = await cache.fetchWithCache<BestInSlotApiResponse<BestInSlotBrc20MarketInfo>>(
      [
        'best-in-slot-brc20-market-info',
        bitcoinNetworkModeToCoreNetworkMode(networkService.getConfig().chain.bitcoin.mode),
        ticker,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get(
              `${getBestInSlotBasePath(networkService.getConfig().chain.bitcoin.mode)}/brc20/market_info?ticker=${ticker}`,
              { signal }
            ),
          { signal }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
    return response.data;
  }

  async function fetchRuneTickerInfo(runeName: string, signal?: AbortSignal) {
    const response = await cache.fetchWithCache<BestInSlotApiResponse<BestInSlotRuneTickerInfo>>(
      [
        'best-in-slot-rune-ticker-info',
        bitcoinNetworkModeToCoreNetworkMode(networkService.getConfig().chain.bitcoin.mode),
        runeName,
      ],
      async () => {
        const res = await limiter.add(
          RateLimiterType.BestInSlot,
          () =>
            axios.get(
              `${getBestInSlotBasePath(networkService.getConfig().chain.bitcoin.mode)}/runes/ticker_info?rune_name=${runeName}`,
              { signal }
            ),
          { signal }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.twoMinutes }
    );
    return response.data;
  }

  return {
    fetchBrc20TickerInfo,
    fetchBrc20MarketInfo,
    fetchRuneTickerInfo,
  };
}
