import { useQuery } from '@tanstack/react-query';

import { createStacksRawTransactionByIdQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetRawTransactionByIdQuery(txid: string) {
  const settings = useUserSettings();
  return useQuery(createStacksRawTransactionByIdQueryConfig(txid, settings));
}
