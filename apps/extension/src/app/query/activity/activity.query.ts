import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses, type Activity, type CryptoAsset } from '@leather.io/models';
import { createActivityByAssetQueryConfig, createActivityQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

function useActivityQuery(
  account: AccountAddresses,
  options: Partial<UseQueryOptions<Activity[], Error, ActivityView[]>> = {}
) {
  const settings = useUserSettings();
  const { select, ...rest } = options;

  return useQuery<Activity[], Error, ActivityView[]>({
    ...createActivityQueryConfig(account, settings),
    ...rest,
    select:
      select ?? (activity => activity.map(item => createActivityView(item, settings.network))),
  });
}

export function useActivity(
  account: AccountAddresses,
  options?: Partial<UseQueryOptions<Activity[], Error, ActivityView[]>>
) {
  return useActivityQuery(account, options);
}

export function useActivityByAsset(
  account: AccountAddresses,
  asset: CryptoAsset,
  options: Partial<UseQueryOptions<Activity[], Error, ActivityView[]>> = {}
) {
  const settings = useUserSettings();
  const { select, ...rest } = options;

  return useQuery<Activity[], Error, ActivityView[]>({
    ...createActivityByAssetQueryConfig(account, asset, settings),
    ...rest,
    select:
      select ?? (activity => activity.map(item => createActivityView(item, settings.network))),
  });
}
