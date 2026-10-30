import { useQuery } from '@tanstack/react-query';

import { createStacksAddressMempoolTransactionsQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetAddressMempoolTransactionsQuery(address: string) {
  const settings = useUserSettings();
  return useQuery(createStacksAddressMempoolTransactionsQueryConfig(address, settings));
}
