import { useQuery } from '@tanstack/react-query';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses, type CryptoAsset } from '@leather.io/models';
import {
  type UseActivityQueryOptions,
  createActivityByAssetQueryConfig,
  createActivityQueryConfig,
} from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

function useActivityQuery(
  account: AccountAddresses,
  options: UseActivityQueryOptions<ActivityView[]> = {}
) {
  const settings = useUserSettings();
  const { select, ...rest } = options;

  return useQuery(
    createActivityQueryConfig(account, settings, {
      ...rest,
      select:
        select ?? (activity => activity.map(item => createActivityView(item, settings.network))),
    })
  );
}

export function useActivity(
  account: AccountAddresses,
  options?: UseActivityQueryOptions<ActivityView[]>
) {
  return useActivityQuery(account, options);
}

export function useActivityByAsset(
  account: AccountAddresses,
  asset: CryptoAsset,
  options: UseActivityQueryOptions<ActivityView[]> = {}
) {
  const settings = useUserSettings();
  const { select, ...rest } = options;

  return useQuery(
    createActivityByAssetQueryConfig(account, asset, settings, {
      ...rest,
      select:
        select ?? (activity => activity.map(item => createActivityView(item, settings.network))),
    })
  );
}
