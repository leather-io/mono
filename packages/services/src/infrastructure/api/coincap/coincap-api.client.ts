import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { mapToCoincapCurrency, readCoincapAssetPrice } from './coincap-api.utils';

export interface CoincapAssetResponse {
  data: {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
  };
  timestamp: number;
}

export interface CoincapApiClient {
  fetchAsset(currency: CryptoCurrency, signal?: AbortSignal): Promise<CoincapAssetResponse>;
  fetchAssetPrice(currency: CryptoCurrency, signal?: AbortSignal): Promise<number | undefined>;
}

export function createCoincapApiClient(cacheService: HttpCacheService) {
  async function fetchAssetPrice(currency: CryptoCurrency, signal?: AbortSignal) {
    const marketData = await fetchAsset(currency, signal);
    return readCoincapAssetPrice(marketData);
  }

  async function fetchAsset(currency: CryptoCurrency, signal?: AbortSignal) {
    return await cacheService.fetchWithCache(
      ['coincap-asset', currency],
      async () => {
        const res = await axios.get<CoincapAssetResponse>(
          `https://api.coincap.io/v2/assets/${mapToCoincapCurrency(currency)}`,
          { signal }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  return {
    fetchAsset,
    fetchAssetPrice,
  };
}
