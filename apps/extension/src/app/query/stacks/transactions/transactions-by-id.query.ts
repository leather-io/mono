import { useQueries, useQuery } from '@tanstack/react-query';

import { createStacksTransactionByIdQueryConfig } from '@leather.io/queries';
import { uniqueArray } from '@leather.io/utils';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetTransactionByIdQuery(txid: string) {
  const settings = useUserSettings();
  return useQuery(createStacksTransactionByIdQueryConfig(txid, settings));
}

export function useGetTransactionByIdListQuery(txids: string[]) {
  const settings = useUserSettings();
  const uniqueTxids = uniqueArray(txids);

  return useQueries({
    queries: uniqueTxids.map(txid => ({
      ...createStacksTransactionByIdQueryConfig(txid, settings),
    })),
  });
}
