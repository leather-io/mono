import {
  type TokenAnalytics,
  type TokenDistribution,
  type TokenHolderSegment,
  percentileKeys,
  topHolderKeys,
} from '@leather.io/models';

import type {
  LeatherApiTokenAnalyticsMapEntry,
  LeatherApiTokenDistribution,
  LeatherApiTokenHolderSegment,
} from '../infrastructure/api/leather/leather-api.client';

type ApiTopHolderKey = keyof LeatherApiTokenDistribution['topHolders'];
type ApiPercentileKey = keyof LeatherApiTokenDistribution['percentiles'];

function mapHolderSegment(segment: LeatherApiTokenHolderSegment): TokenHolderSegment {
  return {
    holderCount: segment.holderCount,
    balance: segment.balance,
    contracts: { count: segment.contracts.count, balance: segment.contracts.balance },
    multisigs: { count: segment.multisigs.count, balance: segment.multisigs.balance },
    individuals: { count: segment.individuals.count, balance: segment.individuals.balance },
  };
}

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

function mapTopHolders(
  distribution: LeatherApiTokenDistribution,
  mapSegment: (segment: LeatherApiTokenHolderSegment) => TokenHolderSegment
) {
  return topHolderKeys.reduce((acc, key: ApiTopHolderKey) => {
    const segment = distribution.topHolders[key];
    return segment ? { ...acc, [key]: mapSegment(segment) } : acc;
  }, {});
}

function mapPercentiles(
  distribution: LeatherApiTokenDistribution,
  mapSegment: (segment: LeatherApiTokenHolderSegment) => TokenHolderSegment
) {
  return percentileKeys.reduce((acc, key: ApiPercentileKey) => {
    const segment = distribution.percentiles[key];
    return segment ? { ...acc, [key]: mapSegment(segment) } : acc;
  }, {});
}

export function mapApiDistributionToTokenDistribution(
  distribution: LeatherApiTokenDistribution
): TokenDistribution {
  return {
    topHolders: mapTopHolders(distribution, mapHolderSegment),
    percentiles: mapPercentiles(distribution, mapHolderSegment),
    updatedAt: distribution.updatedAt,
  };
}
