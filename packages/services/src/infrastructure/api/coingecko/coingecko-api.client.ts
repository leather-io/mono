import axios from 'axios';

import { CryptoCurrency, FiatCurrency } from '@leather.io/models';

import { QueryClientService } from '../../cache/query-client.service';
import {
  mapToCoinGeckoCryptoCurrency,
  mapToCoinGeckoFiatCurrency,
  readMarketDataAmount,
} from './coingecko-api.utils';

export interface CoinGeckoApiMarketData {
  [cryptoCurrency: string]: {
    [fiatCurrency: string]: number;
  };
}

export interface CoinGeckoApiClient {
  fetchMarketData(currency: CryptoCurrency, fiat?: FiatCurrency): Promise<CoinGeckoApiMarketData>;
  fetchMarketDataAmount(currency: CryptoCurrency, fiat?: FiatCurrency): Promise<number>;
}

export function createCoinGeckoApiClient(queryClientService: QueryClientService) {
  const queryClient = queryClientService.getQueryClient();

  async function fetchMarketDataAmount(currency: CryptoCurrency, fiat: FiatCurrency = 'USD') {
    return readMarketDataAmount(await fetchMarketData(currency, fiat), currency, fiat);
  }

  async function fetchMarketData(currency: CryptoCurrency, fiat: FiatCurrency = 'USD') {
    const data = await queryClient.fetchQuery({
      queryKey: ['coin-gecko-market-data', currency, fiat],
      queryFn: async () => _fetchMarketData(currency, fiat),
      staleTime: 30 * 1000,
    });
    return data;
  }

  async function _fetchMarketData(currency: CryptoCurrency, fiat: FiatCurrency = 'USD') {
    const resp = await axios.get<CoinGeckoApiMarketData>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${mapToCoinGeckoCryptoCurrency(currency)}&vs_currencies=${mapToCoinGeckoFiatCurrency(fiat)}`
    );
    return resp.data;
  }

  return {
    fetchMarketData,
    fetchMarketDataAmount,
  };
}
