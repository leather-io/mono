import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses } from '@leather.io/models';
import { type UseActivityQueryOptions, createActivityQueryConfig } from '@leather.io/queries';

export function useActivityQuery(
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
