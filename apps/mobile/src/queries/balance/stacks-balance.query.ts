import { useCallback } from 'react';

import { useMempoolTxsBalance } from '@/queries/stacks/use-mempool-txs-balance';
import { useQueries } from '@tanstack/react-query';

import { Money } from '@leather.io/models';
import {
  AddressBalanceResponse,
  createGetStacksAccountBalanceQueryOptions,
  createStxCryptoAssetBalance,
  createStxMoney,
  useCurrentNetworkState,
  useStacksClient,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { useStxMarketDataQuery } from '../market-data/stx-market-data.query';

interface StxBalances {
  totalStxBalance: Money;
}

function useGetStxBalanceByAddresses(addresses: string[]): StxBalances {
  const { totalData } = useStxBalancesQueries(addresses);

  if (!addresses || addresses.length === 0) return { totalStxBalance: createMoney(0, 'STX') };

  return {
    totalStxBalance: totalData,
  };
}

function useStxBalancesQueries(addresses: string[]) {
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

export function useStxBalance(addresses: string[]) {
  const { totalStxBalance } = useGetStxBalanceByAddresses(addresses);

  const { data: stxMarketData } = useStxMarketDataQuery();
  const stxBalanceUsd = stxMarketData
    ? baseCurrencyAmountInQuote(totalStxBalance, stxMarketData)
    : createMoney(0, 'USD');
  return { availableBalance: totalStxBalance, fiatBalance: stxBalanceUsd };
}
