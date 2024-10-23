import { useCallback } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import type { Money, StxCryptoAssetBalance } from '@leather.io/models';
import { createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import {
  AccountBalanceStxKeys,
  AddressBalanceResponse,
  accountBalanceStxKeys,
} from '../hiro-api-types';
import {
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
} from '../mempool/mempool.hooks';
import { useStacksClient } from '../stacks-client';
import { createGetStacksAccountBalanceQueryOptions } from './account-balance.query';

export function createStxMoney(resp: AddressBalanceResponse) {
  return Object.fromEntries(
    accountBalanceStxKeys.map(key => [key, { amount: new BigNumber(resp.stx[key]), symbol: 'STX' }])
  ) as Record<AccountBalanceStxKeys, Money>;
}

export function createStxCryptoAssetBalance(
  stxMoney: Record<AccountBalanceStxKeys, Money>,
  inboundBalance: Money,
  outboundBalance: Money
): StxCryptoAssetBalance {
  const totalBalance = createMoney(stxMoney.balance.amount, 'STX');
  const unlockedBalance = subtractMoney(stxMoney.balance, stxMoney.locked);

  return {
    availableBalance: subtractMoney(totalBalance, outboundBalance),
    availableUnlockedBalance: subtractMoney(unlockedBalance, outboundBalance),
    inboundBalance,
    lockedBalance: createMoney(stxMoney.locked.amount, 'STX'),
    outboundBalance,
    pendingBalance: subtractMoney(sumMoney([totalBalance, inboundBalance]), outboundBalance),
    totalBalance,
    unlockedBalance,
  };
}

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
function useStxBalanceQuery(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp => createStxMoney(resp),
  });
}
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
