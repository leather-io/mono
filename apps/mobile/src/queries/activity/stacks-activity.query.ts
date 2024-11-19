import { useCallback } from 'react';

import { useMempoolTxsBalance } from '@/queries/stacks/use-mempool-txs-balance';
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

function useStacksActivityQueries(addresses: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  const { inboundBalance, outboundBalance } = useMempoolTxsBalance(addresses);
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetStacksAccountBalanceQueryOptions({
        address,
        client,
        network: network.chain.stacks.url,
      }),
      select: (resp: AddressBalanceResponse) => {
        const initialBalance = createStxMoney(resp);
        return createStxCryptoAssetBalance(initialBalance, inboundBalance, outboundBalance);
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
