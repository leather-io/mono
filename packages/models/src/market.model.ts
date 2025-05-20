import type { CryptoCurrency, QuoteCurrency } from './currencies.model';
import type { Money } from './money.model';

interface MarketPair {
  readonly base: CryptoCurrency;
  readonly quote: QuoteCurrency;
}

export function createMarketPair(base: CryptoCurrency, quote: QuoteCurrency): MarketPair {
  return Object.freeze({ base, quote });
}

export function formatMarketPair({ base, quote }: MarketPair) {
  return `${base}/${quote}`;
}

export interface MarketData {
  readonly pair: MarketPair;
  readonly price: Money;
}

export function createMarketData(pair: MarketPair, price: Money): MarketData {
  if (pair.quote !== price.symbol)
    throw new Error('Cannot create market data when price does not match quote');
  return Object.freeze({ pair, price });
}
