import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { trendingTokensRequest } from '@leather.io/features';
import { createAssetListQueryConfig } from '@leather.io/queries';

export function useTrendingTokensQuery() {
  const settings = useUserSettings();
  return useQuery(createAssetListQueryConfig(trendingTokensRequest, settings));
}
