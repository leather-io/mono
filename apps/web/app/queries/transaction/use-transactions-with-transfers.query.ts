import { useCallback } from 'react';

import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';
import { useQueries } from '@tanstack/react-query';
import { useStacksNetwork } from '~/store/stacks-network';

import { createGetAccountTransactionsWithTransfersQueryOptions } from '@leather.io/query';

import { useStacksClient } from '../stacks/stacks-client';

interface TransactionsWithTransfersResult {
  queries: ReturnType<typeof useQueries>;
  totalData: AddressTransactionWithTransfers[];
  pending: boolean;
}

export function useGetAccountTransactionsWithTransfersQueries(
  addresses: string[]
): TransactionsWithTransfersResult {
  const { networkPreference } = useStacksNetwork();
  const client = useStacksClient();
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetAccountTransactionsWithTransfersQueryOptions({
        address,
        client,
        network: networkPreference.chain.stacks.url,
      }),
    })),
  });
  const combinedResult = useCallback(
    () => {
      const mappedQueries = queries.map(result => result.data).filter(Boolean);

      const totalData = mappedQueries.reduce((acc: AddressTransactionWithTransfers[], item) => {
        const txs = item?.results as AddressTransactionWithTransfers[];
        if (txs) {
          return [...acc, ...txs];
        }
        return acc;
      }, []);

      return {
        queries,
        totalData,
        pending: queries.some(result => result.isPending),
      };
    },
    // TODO: we shouldn't depend on queries
    // eslint-disable-next-line @tanstack/query/no-unstable-deps
    [queries]
  );

  return combinedResult();
}
