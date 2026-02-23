import { mapApiAnalyticsToTokenAnalytics } from './token-analytics.utils';

describe(mapApiAnalyticsToTokenAnalytics.name, () => {
  test('maps full API entry to TokenAnalytics', () => {
    const entry = {
      circulatingSupply: 1_000_000,
      holderCount: 500,
      distributionScore: 75,
      trustScore: 80,
      trendingScore: 60,
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const result = mapApiAnalyticsToTokenAnalytics(entry);
    expect(result).toEqual({
      circulatingSupply: 1_000_000,
      holderCount: 500,
      distributionScore: 75,
      trustScore: 80,
      trendingScore: 60,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
  });

  test('omits optional fields when undefined', () => {
    const entry = {
      circulatingSupply: 0,
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const result = mapApiAnalyticsToTokenAnalytics(entry);
    expect(result.circulatingSupply).toBe(0);
    expect(result.updatedAt).toBe(entry.updatedAt);
    expect(result).not.toHaveProperty('holderCount');
    expect(result).not.toHaveProperty('distributionScore');
  });
});
