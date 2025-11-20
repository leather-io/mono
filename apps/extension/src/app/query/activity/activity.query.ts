import { useQuery } from '@tanstack/react-query';

import { type AccountAddresses } from '@leather.io/models';
import { type UseActivityQueryOptions, createActivityQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

function useActivityQuery(account: AccountAddresses, options: UseActivityQueryOptions = {}) {
  const settings = useUserSettings();
  return useQuery(createActivityQueryConfig(account, settings, options));
}

export function useActivity(account: AccountAddresses, options?: UseActivityQueryOptions) {
  return useActivityQuery(account, options);
}
