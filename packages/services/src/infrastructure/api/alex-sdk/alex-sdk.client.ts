import { AlexSDK, TokenInfo } from 'alex-sdk';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';

export type AlexSdkLatestPrices = Partial<{
  [currency in string]: number;
}>;
export type AlexSdkTokenInfo = TokenInfo;

export interface AlexSdkClient {
  getLatestPrices(): Promise<AlexSdkLatestPrices>;
  getSwappableCurrencies(): Promise<AlexSdkTokenInfo[]>;
}

const alex = new AlexSDK();

export function createAlexSdkClient(cacheService: HttpCacheService): AlexSdkClient {
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
    getLatestPrices,
    getSwappableCurrencies,
  };
}
