import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { trendingTokensRequest } from '@leather.io/features';
import { createAssetListQueryConfig } from '@leather.io/queries';
import { AssetListRequest } from '@leather.io/services';

const mobileTrendingTokensRequest: AssetListRequest = {
  ...trendingTokensRequest,
  filters: { ...trendingTokensRequest.filters, includeHidden: true },
};

export function useTrendingTokensQuery() {
  const settings = useUserSettings();
  return useQuery(createAssetListQueryConfig(mobileTrendingTokensRequest, settings));
}
