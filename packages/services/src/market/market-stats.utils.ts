import { type HistoricalPeriod, type MarketStats, historicalPeriods } from '@leather.io/models';

import type { LeatherApiPriceMapEntry } from '../infrastructure/api/leather/leather-api.client';

export function mapPriceEntryToMarketStats(entry: LeatherApiPriceMapEntry): MarketStats {
  const priceChange: Partial<Record<HistoricalPeriod, number | null>> = {};
  if (entry.priceChange) {
    for (const period of historicalPeriods) {
      const value = entry.priceChange[period];
      if (value !== undefined) {
        priceChange[period] = value;
      }
    }
  }
  return {
    priceChange,
    ...(entry.marketCap !== undefined && { marketCap: entry.marketCap }),
  };
}
