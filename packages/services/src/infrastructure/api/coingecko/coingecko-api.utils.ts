import { CryptoCurrency, FiatCurrency } from '@leather.io/models';

import { CoinGeckoMarketData } from './coingecko-api.client';

export const coinGeckoCurrencyMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'blockstack',
};

export function mapToCoinGeckoCurrency(currency: CryptoCurrency): string {
  return coinGeckoCurrencyMap[currency];
}

export function mapToCoinGeckoFiat(fiat: FiatCurrency): string {
  return fiat.toLowerCase();
}

export function readCoinGeckoMarketDataPrice(
  marketData: CoinGeckoMarketData,
  currency: CryptoCurrency
): number | undefined {
  try {
    return marketData[mapToCoinGeckoCurrency(currency)]['usd'];
  } catch (ignored) {
    return;
  }
}
