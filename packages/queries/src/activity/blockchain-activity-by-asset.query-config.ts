import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { AccountAddresses, BlockchainActivity, CryptoAssetId } from '@leather.io/models';
import { type UserSettings, getBlockchainActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

export function createBlockchainActivityByAssetIdQueryKey(
  account: AccountAddresses,
  assetId: CryptoAssetId,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'blockchain-activity-service--get-activity-by-asset-id',
    [account, assetId],
    settings
  );
}

export function createBlockchainActivityByAssetIdQueryConfig(
  account: AccountAddresses,
  assetId: CryptoAssetId,
  settings: UserSettings
) {
  return {
    queryKey: createBlockchainActivityByAssetIdQueryKey(account, assetId, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBlockchainActivityService().getActivityByAssetId(account, assetId, signal),
    ...activityQueryOptions,
  } satisfies UseQueryOptions<BlockchainActivity[], Error>;
}
