import { useCallback } from 'react';

import { useUserSettings } from '@/hooks/use-user-settings';
import { type AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import { useQueries } from '@tanstack/react-query';

import { createStacksAddressTransactionsQueryConfig } from '@leather.io/queries';
import { uniqueArray } from '@leather.io/utils';

export function useGetAccountTransactionsWithTransfersQueries(addresses: string[]) {
  const settings = useUserSettings();
  const uniqueAddresses = uniqueArray(addresses);
  const queries = useQueries({
    queries: uniqueAddresses.map(address => ({
      ...createStacksAddressTransactionsQueryConfig(address, settings),
    })),
  });
  const combinedResult = useCallback(
    () => ({
      queries,
      totalData: queries.flatMap((result): AddressTransactionWithTransfers[] => {
        if (result.data) return result.data;
        return [];
      }),
      pending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}
