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
import { createMoney, sumMoney } from '@leather.io/utils';

export function useStxBalancesQueries(addresses: string[]) {
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
      queries,
      totalData: queries
        .map(result => result.data)
        .reduce(
          (total, data) => sumMoney([total, data?.totalBalance ?? createMoney(0, 'STX')]),
          createMoney(0, 'STX')
        ),
      pending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}
