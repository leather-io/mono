import { type TokenAnalytics } from '@leather.io/models';

import type { LeatherApiTokenAnalyticsMapEntry } from '../infrastructure/api/leather/leather-api.client';

export function mapApiAnalyticsToTokenAnalytics(
  entry: LeatherApiTokenAnalyticsMapEntry
): TokenAnalytics {
  return {
    circulatingSupply: entry.circulatingSupply,
    ...(entry.holderCount !== undefined && { holderCount: entry.holderCount }),
    ...(entry.distributionScore !== undefined && { distributionScore: entry.distributionScore }),
    ...(entry.trustScore !== undefined && { trustScore: entry.trustScore }),
    ...(entry.trendingScore !== undefined && { trendingScore: entry.trendingScore }),
    updatedAt: entry.updatedAt,
  };
}
