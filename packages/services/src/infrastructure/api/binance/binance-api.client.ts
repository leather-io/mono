import axios from 'axios';

import { CryptoCurrency } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import { readBinanceMarketDataPrice } from './binance-api.utils';

export interface BinanceMarketData {
  symbol: string;
  price: string;
}

export interface BinanceApiClient {
  fetchMarketData(currency: CryptoCurrency, signal?: AbortSignal): Promise<BinanceMarketData>;
  fetchMarketDataPrice(currency: CryptoCurrency, signal?: AbortSignal): Promise<number | undefined>;
}

export function createBinanceApiClient(cacheService: HttpCacheService) {
  async function fetchMarketDataPrice(currency: CryptoCurrency, signal?: AbortSignal) {
    const marketData = await fetchMarketData(currency, signal);
    return readBinanceMarketDataPrice(marketData);
  }

  async function fetchMarketData(currency: CryptoCurrency, signal?: AbortSignal) {
    return await cacheService.fetchWithCache(
      ['binance-market-data', currency],
      async () => {
        const res = await axios.get<BinanceMarketData>(
          `https://api1.binance.com/api/v3/ticker/price?symbol=${currency}USDT`,
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
