import type { LeatherApiPriceMapEntry } from '../infrastructure/api/leather/leather-api.client';
import { mapPriceEntryToMarketStats } from './market-stats.utils';

describe(mapPriceEntryToMarketStats.name, () => {
  test('maps priceChange and marketCap to MarketStats', () => {
    const entry = {
      price: 50000,
      priceChange: { '1d': 2.5, '1w': -1 },
      marketCap: 1_000_000_000,
    } as LeatherApiPriceMapEntry;
    const result = mapPriceEntryToMarketStats(entry);
    expect(result.priceChange).toEqual({ '1d': 2.5, '1w': -1 });
    expect(result.marketCap).toBe(1_000_000_000);
  });

  test('omits marketCap when undefined', () => {
    const entry = {
      price: 50000,
      priceChange: { '1d': 0 },
    } as LeatherApiPriceMapEntry;
    const result = mapPriceEntryToMarketStats(entry);
    expect(result.priceChange).toEqual({ '1d': 0 });
    expect(result).not.toHaveProperty('marketCap');
  });

  test('returns empty priceChange when entry has none', () => {
    const entry = { price: 50000, marketCap: 100 } as LeatherApiPriceMapEntry;
    const result = mapPriceEntryToMarketStats(entry);
    expect(result.priceChange).toEqual({});
    expect(result.marketCap).toBe(100);
  });
});
