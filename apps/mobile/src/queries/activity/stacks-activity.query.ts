import { useCallback } from 'react';

import { useMempoolTxs } from '@/queries/stacks/use-mempool-txs-balance';
import { useQueries } from '@tanstack/react-query';

import {
  AddressBalanceResponse,
  createGetStacksAccountBalanceQueryOptions,
  createStxCryptoAssetBalance,
  createStxMoney,
  useCurrentNetworkState,
  useStacksClient,
} from '@leather.io/query';

interface StacksActivity {
  activity: unknown[];
}

function useGetStacksActivityByAddresses(addresses: string[]): StacksActivity {
  const { totalStacksActivity } = useStacksActivityQueries(addresses);

  if (!addresses || addresses.length === 0) return { activity: [] };

  return {
    activity: totalStacksActivity,
  };
}

/**
 * In extension activity list
 * transactionListStacksTxs =
 * stacksTransactionsWithTransfers = useGetAccountTransactionsWithTransfersQuery
 *
 */

function useStacksActivityQueries(addresses: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  const { query, pendingTxs, confirmedTxs } = useMempoolTxs(addresses);
  console.log('useMempoolTxs query', query);
  console.log('useMempoolTxs pendingTxs', pendingTxs);
  console.log('useMempoolTxs confirmedTxs', confirmedTxs);
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetStacksAccountBalanceQueryOptions({
        address,
        client,
        network: network.chain.stacks.url,
      }),
      select: (resp: AddressBalanceResponse) => {
        // const initialBalance = createStxMoney(resp);
        // return createStxCryptoAssetBalance(initialBalance, inboundBalance, outboundBalance);
        // console.log('selected', resp);
        return resp;
      },
    })),
  });

  const combinedResult = useCallback(
    () => ({
      totalStacksActivity: queries, // I think this queries is what we want for activity
      pending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}

export function useStacksActivity(addresses: string[]) {
  const { activity } = useGetStacksActivityByAddresses(addresses);

  return { activity };
}
