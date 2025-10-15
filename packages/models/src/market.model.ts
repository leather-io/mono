import type { Currency, QuoteCurrency } from './currencies.model';
import type { Money } from './money.model';

interface MarketPair {
  readonly base: Currency;
  readonly quote: QuoteCurrency;
}

export function createMarketPair(base: Currency, quote: QuoteCurrency): MarketPair {
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

export const historicalPeriods = ['1d', '1w', '1m', '3m', '6m', '1y'] as const;
export type HistoricalPeriod = (typeof historicalPeriods)[number];

export interface MarketPriceSnapshot {
  price: Money;
  timestamp: number;
}

export interface MarketPriceHistory {
  period: HistoricalPeriod;
  changePercentage: number;
  prices: MarketPriceSnapshot[];
}
