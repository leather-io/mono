import { AlexSDK, TokenInfo } from 'alex-sdk';
import axios from 'axios';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';

export interface AlexApiTokenPricesResponse {
  data: AlexApiTokenPrice[];
}
export interface AlexApiTokenPrice {
  contract_id: string;
  last_price_usd: number;
}
export type AlexSdkLatestPrices = Partial<{
  [currency in string]: number;
}>;
export type AlexSdkTokenInfo = TokenInfo;

export interface AlexSdkClient {
  getApiTokenPrices(signal?: AbortSignal): Promise<AlexApiTokenPrice[]>;
  getLatestPrices(): Promise<AlexSdkLatestPrices>;
  getSwappableCurrencies(): Promise<AlexSdkTokenInfo[]>;
}

const alexApiBaseUrl = 'https://api.alexgo.io/v2/public';

const alex = new AlexSDK();

export function createAlexSdkClient(cacheService: HttpCacheService): AlexSdkClient {
  async function getApiTokenPrices(signal?: AbortSignal) {
    return await cacheService.fetchWithCache(
      ['alex-api-client-token-prices'],
      async () => {
        const res = await axios.get<AlexApiTokenPricesResponse>(`${alexApiBaseUrl}/token-prices`, {
          signal,
        });
        return res.data.data;
      },
      { ttl: HttpCacheTimeMs.tenMinutes }
    );
  }

  async function getLatestPrices() {
    return await cacheService.fetchWithCache<AlexSdkLatestPrices>(
      ['alex-sdk-client-latest-prices'],
      async () => await alex.getLatestPrices(),
      { ttl: HttpCacheTimeMs.tenMinutes }
    );
  }

  async function getSwappableCurrencies() {
    const data = await cacheService.fetchWithCache<AlexSdkTokenInfo[]>(
      ['alex-sdk-client-get-swappable-currencies'],
      async () => await alex.fetchSwappableCurrency(),
      { ttl: HttpCacheTimeMs.oneHour }
    );
    return data;
  }

  return {
    getApiTokenPrices,
    getLatestPrices,
    getSwappableCurrencies,
  };
}
