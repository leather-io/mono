import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { analytics } from '~/features/analytics/analytics';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useStacksNetwork } from '~/store/stacks-network';

import { createGetStxAddressBalanceQueryOptions } from '@leather.io/query';
import { createMoney, createStxBalance } from '@leather.io/utils';

import { useMempoolTxsBalance } from './use-mempool-txs-balance';

function useStxBalanceQuery(address: string) {
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();

  return useQuery(
    createGetStxAddressBalanceQueryOptions({
      address,
      client,
      network: networkPreference.chain.stacks.url,
    })
  );
}

export function useStxBalance(address: string) {
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();

  const initialBalanceQuery = useStxBalanceQuery(address);

  const { inboundBalance, outboundBalance, query } = useMempoolTxsBalance([address]);

  const filteredBalanceQuery = useQuery({
    ...createGetStxAddressBalanceQueryOptions({
      address,
      client,
      network: networkPreference.chain.stacks.url,
    }),
    select: resp => {
      const initialBalance = createMoney(new BigNumber(resp.balance), 'STX');
      const stxBalance = createStxBalance(initialBalance, inboundBalance, outboundBalance);
      void analytics.track('stx_balance_updated', stxBalance);
      return stxBalance;
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
  const stxBalance = useStxBalance(address);

  return stxBalance.filteredBalanceQuery.data?.lockedBalance ?? createMoney(0, 'STX');
}

export function useStxAvailableUnlockedBalance(address: string) {
  const stxBalance = useStxBalance(address);

  return stxBalance.filteredBalanceQuery.data?.unlockedBalance ?? createMoney(0, 'STX');
}
