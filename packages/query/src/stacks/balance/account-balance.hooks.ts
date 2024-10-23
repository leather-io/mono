import { useCallback } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { createMoney, sumMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { AddressBalanceResponse } from '../hiro-api-types';
import {
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
} from '../mempool/mempool.hooks';
import { useStacksClient } from '../stacks-client';
import { createGetStacksAccountBalanceQueryOptions } from './account-balance.query';
import { createStxCryptoAssetBalance } from './create-stx-crypto-asset-balance';
import { createStxMoney } from './create-stx-money';
import { useStxBalanceQuery } from './use-stx-balance-query.hooks';

export function useStxBalancesQueries(addresses: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  // to get these correctly more refactoring and combining of queries is needed
  // this time in useMempoolTxsInboundBalance + useMempoolTxsOutboundBalance
  const inboundBalance = createMoney(0, 'STX');
  const outboundBalance = createMoney(0, 'STX');

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

  return combinedResult;
}

// I am just returning the raw data now but I need
// to do the same logic to format the balance as before
// in useStxCryptoAssetBalance

// export function useStxCryptoAssetBalances(addresses: string[]) {
//   // Could be better to refactor this to accept an array of addresses and return an array of balances
//   // This would allow us to fetch balances for multiple accounts in a single query

//   const client = useStacksClient();
//   const network = useCurrentNetworkState();

//   const initialBalanceQuery = useStxBalancesQueries(addresses);

//   const defaultPendingBalance = createMoney(0, 'STX');
//   const { balance: inboundBalance = defaultPendingBalance, query } =
//     useMempoolTxsInboundBalance(address);
//   const { balance: outboundBalance = defaultPendingBalance } =
//     useMempoolTxsOutboundBalance(address);

//   const filteredBalanceQuery = useQuery({
//     ...createGetStacksAccountBalanceQueryOptions({
//       address,
//       client,
//       network: network.chain.stacks.url,
//     }),
//     select: resp => {
//       const initialBalance = createStxMoney(resp);
//       return createStxCryptoAssetBalance(initialBalance, inboundBalance, outboundBalance);
//     },
//     enabled: !!initialBalanceQuery.data,
//   });

//   return {
//     initialBalanceQuery,
//     filteredBalanceQuery,
//     isLoadingAdditionalData: query.isLoading,
//   };
// }

export function useStxCryptoAssetBalance(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  const initialBalanceQuery = useStxBalanceQuery(address);

  const defaultPendingBalance = createMoney(0, 'STX');
  const { balance: inboundBalance = defaultPendingBalance, query } =
    useMempoolTxsInboundBalance(address);
  const { balance: outboundBalance = defaultPendingBalance } =
    useMempoolTxsOutboundBalance(address);

  const filteredBalanceQuery = useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
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

export function useStxAvailableUnlockedBalance(address: string) {
  const stxBalance = useStxCryptoAssetBalance(address);

  return stxBalance.filteredBalanceQuery.data?.unlockedBalance ?? createMoney(0, 'STX');
}

export function useStacksAccountBalanceFungibleTokens(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp => resp.fungible_tokens,
  });
}
