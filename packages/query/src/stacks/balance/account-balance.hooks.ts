import { useQuery } from '@tanstack/react-query';

import { createMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import {
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
} from '../mempool/mempool.hooks';
import { useStacksClient } from '../stacks-client';
import { createGetStacksAccountBalanceQueryOptions } from './account-balance.query';
import { createStxCryptoAssetBalance } from './create-stx-crypto-asset-balance';
import { createStxMoney } from './create-stx-money';
import { useStxBalanceQuery } from './use-stx-balance.query';

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
