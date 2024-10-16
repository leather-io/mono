import { useCallback } from 'react';

import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import { useQueries } from '@tanstack/react-query';

import {
  createGetAccountTransactionsWithTransfersQueryOptions,
  useCurrentNetworkState,
  useStacksClient,
} from '@leather.io/query';

export function useGetAccountTransactionsWithTransfersQueries(addresses: string[]) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetAccountTransactionsWithTransfersQueryOptions({
        address,
        client,
        network: network.chain.stacks.url,
      }),
    })),
  });
  const combinedResult = useCallback(
    () => ({
      queries,
      totalData: queries
        .map(result => result.data)
        .reduce((acc, result) => {
          if (result?.results) {
            return [...acc, ...result.results];
          }
          return acc;
        }, [] as AddressTransactionWithTransfers[]),
      pending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}
