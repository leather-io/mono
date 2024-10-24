import { useQuery } from '@tanstack/react-query';

import {
  createGetStacksAccountBalanceQueryOptions,
  createStxCryptoAssetBalance,
  createStxMoney,
  useCurrentNetworkState,
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
  useStacksClient,
} from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { useStxBalancesQueries } from './use-stx-balances-query.hooks';

export function useStxCryptoAssetBalances(addresses: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  const initialBalanceQuery = useStxBalancesQueries(addresses);

  const defaultPendingBalance = createMoney(0, 'STX');

  // PETE next work on changing useMempoolTxsInboundBalance to accept an array
  // check how works with single then improve
  const singleAddress = addresses[0] ?? '';

  const { balance: inboundBalance = defaultPendingBalance, query } =
    useMempoolTxsInboundBalance(singleAddress);
  const { balance: outboundBalance = defaultPendingBalance } =
    useMempoolTxsOutboundBalance(singleAddress);

  const filteredBalanceQuery = useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address: singleAddress,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp => {
      const initialBalance = createStxMoney(resp);
      return createStxCryptoAssetBalance(initialBalance, inboundBalance, outboundBalance);
    },
    enabled: !!initialBalanceQuery.data,
  });

  return {
    initialBalanceQuery,
    filteredBalanceQuery,
    isLoadingAdditionalData: query.isLoading,
  };
}
