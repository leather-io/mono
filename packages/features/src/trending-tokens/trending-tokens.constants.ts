import type { AssetListRequest } from '@leather.io/services';

export const trendingTokensRequest: AssetListRequest = {
  filters: { protocols: ['sip10'], minTrendingScore: 8 },
  includes: { marketStats: true },
  sort: [{ field: 'trendingScore', direction: 'desc' }],
  pagination: { limit: 15, offset: 0 },
};
