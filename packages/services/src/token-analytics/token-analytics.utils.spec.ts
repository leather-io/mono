import {
  mapApiAnalyticsToTokenAnalytics,
  mapApiDistributionToTokenDistribution,
} from './token-analytics.utils';

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

describe(mapApiDistributionToTokenDistribution.name, () => {
  test('maps API distribution to TokenDistribution', () => {
    const bucket = {
      holderCount: 10,
      balance: 1000,
      contracts: { count: 2, balance: 200 },
      multisigs: { count: 1, balance: 100 },
      individuals: { count: 7, balance: 700 },
    };
    const distribution = {
      topHolders: { 1: bucket, 10: bucket },
      percentiles: { 50: bucket },
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const result = mapApiDistributionToTokenDistribution(distribution);
    expect(result.updatedAt).toBe('2025-01-01T00:00:00.000Z');
    expect(result.topHolders[1]).toEqual(bucket);
    expect(result.topHolders[10]).toEqual(bucket);
    expect(result.percentiles[50]).toEqual(bucket);
  });

  test('returns empty topHolders and percentiles when none present', () => {
    const distribution = {
      topHolders: {},
      percentiles: {},
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const result = mapApiDistributionToTokenDistribution(distribution);
    expect(result.topHolders).toEqual({});
    expect(result.percentiles).toEqual({});
    expect(result.updatedAt).toBe(distribution.updatedAt);
  });
});
