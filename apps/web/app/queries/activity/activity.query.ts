import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses, type Activity } from '@leather.io/models';
import { createActivityQueryConfig } from '@leather.io/queries';

export function useActivityQuery(
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
