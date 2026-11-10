import { useQuery } from '@tanstack/react-query';

import { createStacksAddressTransactionsQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetAccountTransactionsWithTransfersQuery(address: string) {
  const settings = useUserSettings();
  return useQuery(createStacksAddressTransactionsQueryConfig(address, settings));
}
