import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { createAssetListQueryConfig } from '@leather.io/queries';
import { AssetListRequest } from '@leather.io/services';

const trendingTokensRequest: AssetListRequest = {
  filters: { protocols: ['sip10'], minTrendingScore: 8 },
  includes: { marketStats: true },
  sort: [{ field: 'trendingScore', direction: 'desc' }],
  pagination: { limit: 15, offset: 0 },
};

export function useTrendingTokensQuery() {
  const settings = useUserSettings();
  return useQuery(createAssetListQueryConfig(trendingTokensRequest, settings));
}
