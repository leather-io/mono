import { useQuery } from '@tanstack/react-query';

import { trendingTokensRequest } from '@leather.io/features';
import { createAssetListQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useTrendingTokensQuery() {
  const settings = useUserSettings();
  return useQuery(createAssetListQueryConfig(trendingTokensRequest, settings));
}
