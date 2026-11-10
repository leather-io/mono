import { toFetchState } from '@/components/loading';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useQueries, useQuery } from '@tanstack/react-query';

import {
  createBitcoinTransactionByTxIdQueryConfig,
  createStacksTransactionByIdQueryConfig,
} from '@leather.io/queries';
import { uniqueArray } from '@leather.io/utils';

export function useGetTransactionByIdListQuery(txids: string[]) {
  const settings = useUserSettings();
  const uniqueTxids = uniqueArray(txids);

  return useQueries({
    queries: uniqueTxids.map(txid => {
      return {
        ...createStacksTransactionByIdQueryConfig(txid, settings),
      };
    }),
  });
}

function useGetStxTransactionByIdQuery(txid: string) {
  const settings = useUserSettings();
  return useQuery({
    ...createStacksTransactionByIdQueryConfig(txid, settings),
    refetchInterval(query) {
      if (!query.state.data || query.state.data.status === 'pending') return 1000;
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
