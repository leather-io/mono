import {
  AddressTransactionWithTransfers,
  type AddressTransactionsWithTransfersListResponse,
} from '@stacks/stacks-blockchain-api-types';
import { UseQueryResult, useQueries } from '@tanstack/react-query';
import { useStacksNetwork } from '~/store/stacks-network';

import { createGetAccountTransactionsWithTransfersQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useStacksClient } from '../stacks/stacks-client';

interface TransactionsWithTransfersResult {
  queries: ReturnType<typeof useQueries>;
  totalData: AddressTransactionWithTransfers[];
  pending: boolean;
}

function combineAccountTransactionsWithTransfersQueries(
  results: UseQueryResult<AddressTransactionsWithTransfersListResponse, Error>[]
) {
  const mappedQueries = results.map(result => result.data).filter(Boolean);

  const totalData = mappedQueries.reduce((acc: AddressTransactionWithTransfers[], item) => {
    const txs = item?.results as AddressTransactionWithTransfers[];
    if (txs) {
      return [...acc, ...txs];
    }
    return acc;
  }, []);

  return {
    queries: results,
    totalData,
    pending: results.some(result => result.isPending),
  };
}

export function useGetAccountTransactionsWithTransfersQueries(
  addresses: string[]
): TransactionsWithTransfersResult {
  const { networkPreference } = useStacksNetwork();
  const client = useStacksClient();
  const uniqueAddresses = uniqueArray(addresses);
  return useQueries({
    queries: uniqueAddresses.map(address => ({
      ...createGetAccountTransactionsWithTransfersQueryOptions({
        address,
        client,
        network: networkPreference.chain.stacks.url,
      }),
    })),
    combine: combineAccountTransactionsWithTransfersQueries,
  });
}
