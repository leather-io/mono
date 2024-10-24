import { CryptoCurrency, FiatCurrency } from '@leather.io/models';

import { CoinGeckoApiMarketData } from './coingecko-api.client';

export const coinGeckoCurrencyMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'blockstack',
};

export function mapToCoinGeckoCryptoCurrency(currency: CryptoCurrency): string {
  return coinGeckoCurrencyMap[currency];
}

export function mapToCoinGeckoFiatCurrency(fiat: FiatCurrency): string {
  return fiat.toLowerCase();
}

export function readMarketDataAmount(
  marketData: CoinGeckoApiMarketData,
  currency: CryptoCurrency,
  fiat: FiatCurrency
) {
  return marketData[mapToCoinGeckoCryptoCurrency(currency)][mapToCoinGeckoFiatCurrency(fiat)];
}
