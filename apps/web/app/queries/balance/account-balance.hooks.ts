import { useQuery } from '@tanstack/react-query';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useStacksNetwork } from '~/store/stacks-network';

import {
  createGetStacksAccountBalanceQueryOptions,
  createStxCryptoAssetBalance,
  createStxMoney,
} from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { useMempoolTxsBalance } from './use-mempool-txs-balance';

function useStxBalanceQuery(address: string) {
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: networkPreference.chain.stacks.url,
    }),
    select: resp => createStxMoney(resp),
  });
}

export function useStxCryptoAssetBalance(address: string) {
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();

  const initialBalanceQuery = useStxBalanceQuery(address);

  const { inboundBalance, outboundBalance, query } = useMempoolTxsBalance([address]);

  const filteredBalanceQuery = useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: networkPreference.chain.stacks.url,
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
    isLoadingAdditionalData: query.isPending,
  };
}

export function useStxAvailableLockedBalance(address: string) {
  const stxBalance = useStxCryptoAssetBalance(address);

  return stxBalance.filteredBalanceQuery.data?.lockedBalance ?? createMoney(0, 'STX');
}

export function useStxAvailableUnlockedBalance(address: string) {
  const stxBalance = useStxCryptoAssetBalance(address);

  return stxBalance.filteredBalanceQuery.data?.unlockedBalance ?? createMoney(0, 'STX');
}

export function useStacksAccountBalanceFungibleTokens(address: string) {
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: networkPreference.chain.stacks.url,
    }),
    select: resp => resp.fungible_tokens,
  });
}
