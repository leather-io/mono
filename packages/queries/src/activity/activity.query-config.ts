import { type QueryFunctionContext, type UseQueryOptions } from '@tanstack/react-query';

import { type AccountAddresses, type Activity, type CryptoAsset } from '@leather.io/models';
import { type UserSettings, getActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

function createActivityKeyParams(account: AccountAddresses) {
  const { id, bitcoin, stacks } = account;
  const hdBitcoin = bitcoin?.type === 'hd' ? bitcoin : undefined;
  return [
    id.fingerprint,
    id.accountIndex,
    hdBitcoin?.taprootDescriptor ?? null,
    hdBitcoin?.nativeSegwitDescriptor ?? null,
    hdBitcoin?.zeroIndexNativeSegwitPayerAddress ?? null,
    hdBitcoin?.zeroIndexTaprootPayerAddress ?? null,
    stacks?.stxAddress ?? null,
  ] as const;
}

export function createActivityQueryKey(account: AccountAddresses, settings: UserSettings) {
  return createServiceQueryKey(
    'activity-service--get-activity',
    createActivityKeyParams(account),
    settings
  );
}

export function createActivityQueryConfig(account: AccountAddresses, settings: UserSettings) {
  return {
    queryKey: createActivityQueryKey(account, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivity(account, signal),
    ...activityQueryOptions,
  } satisfies UseQueryOptions<Activity[], Error>;
}

export function createActivityByAssetQueryKey(
  account: AccountAddresses,
  asset: CryptoAsset,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'activity-service--get-activity-by-asset',
    [...createActivityKeyParams(account), asset],
    settings
  );
}

export function createActivityByAssetQueryConfig(
  account: AccountAddresses,
  asset: CryptoAsset,
  settings: UserSettings
) {
  return {
    queryKey: createActivityByAssetQueryKey(account, asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivityByAsset(account, asset, signal),
    ...activityQueryOptions,
  } satisfies UseQueryOptions<Activity[], Error>;
}
