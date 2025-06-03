import { Money } from '@leather.io/models';

export type PriceHistoryPeriod = '24h' | '7d' | '30d' | '90d' | '1y';

export interface AssetPriceChange {
  period: PriceHistoryPeriod;
  changePercent: number;
}

export interface AssetPriceHistory {
  period: PriceHistoryPeriod;
  prices: AssetPriceSnapshot[];
}

export interface AssetPriceSnapshot {
  price: Money;
  timestamp: number;
}

export interface AssetDescription {
  description: string | null;
}
