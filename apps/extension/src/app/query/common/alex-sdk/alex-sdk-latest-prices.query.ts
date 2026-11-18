import { useQuery } from '@tanstack/react-query';

import { createAlexLatestPricesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useAlexSdkLatestPricesQuery() {
  const settings = useUserSettings();
  return useQuery(createAlexLatestPricesQueryConfig(settings));
}
