import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type AssetListRequest,
  type AssetListResponse,
  type UserSettings,
  getAssetListService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { marketDataQueryOptions } from '../shared/query-options';

export function createAssetListQueryKey(request: AssetListRequest, settings: UserSettings) {
  return createServiceQueryKey('asset-list-service--get-asset-list', [request], settings);
}

export function createAssetListQueryConfig(request: AssetListRequest, settings: UserSettings) {
  return {
    queryKey: createAssetListQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAssetListService().getAssetList(request, signal),
    ...marketDataQueryOptions,
  } satisfies UseQueryOptions<AssetListResponse, Error>;
}
