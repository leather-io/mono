import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { mapToCoinGeckoCurrency, readCoinGeckoMarketDataPrice } from './coingecko-api.utils';

export interface CoinGeckoMarketData {
  [cryptoCurrency: string]: {
    [fiatCurrency: string]: number;
  };
}

export interface CoinGeckoApiClient {
  fetchMarketData(currency: CryptoCurrency, signal?: AbortSignal): Promise<CoinGeckoMarketData>;
  fetchMarketDataPrice(currency: CryptoCurrency, signal?: AbortSignal): Promise<number | undefined>;
}

export function createCoinGeckoApiClient(cacheService: HttpCacheService) {
  async function fetchMarketDataPrice(currency: CryptoCurrency, signal?: AbortSignal) {
    const marketData = await fetchMarketData(currency, signal);
    return readCoinGeckoMarketDataPrice(marketData, currency);
  }

  async function fetchMarketData(currency: CryptoCurrency, signal?: AbortSignal) {
    return await cacheService.fetchWithCache(
      ['coin-gecko-market-data', currency],
      async () => {
        const res = await axios.get<CoinGeckoMarketData>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${mapToCoinGeckoCurrency(currency)}&vs_currencies=usd`,
          { signal }
        );
        return res.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  return {
    fetchMarketData,
    fetchMarketDataPrice,
  };
}
