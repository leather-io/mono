import { toFetchState } from '@/components/loading';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useQueries, useQuery } from '@tanstack/react-query';

import {
  createBitcoinTransactionByTxIdQueryConfig,
  createStacksTransactionByIdQueryConfig,
} from '@leather.io/queries';
import { createGetTransactionByIdQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useStacksClient } from '../stacks/stacks-client';

export function useGetTransactionByIdListQuery(txids: string[]) {
  const client = useStacksClient();
  const uniqueTxids = uniqueArray(txids);

  return useQueries({
    queries: uniqueTxids.map(txid => {
      return {
        ...createGetTransactionByIdQueryOptions({ client, txid }),
      };
    }),
  });
}

function useGetStxTransactionByIdQuery(txid: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createStacksTransactionByIdQueryConfig(txid, settings),
    refetchInterval(query) {
      if (!query.state.data || query.state.data.tx_status === 'pending') return 1000;
      return false;
    },
  });
}

export function useGetStxTransactionById(txid: string) {
  return toFetchState(useGetStxTransactionByIdQuery(txid));
}

function useGetBtcTransactionByIdQuery(txid: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createBitcoinTransactionByTxIdQueryConfig(txid, settings),
    refetchInterval(query) {
      if (!query.state.data || query.state.data.time) return 3000;
      return false;
    },
  });
}

export function useGetBtcTransactionById(txid: string) {
  return toFetchState(useGetBtcTransactionByIdQuery(txid));
}
