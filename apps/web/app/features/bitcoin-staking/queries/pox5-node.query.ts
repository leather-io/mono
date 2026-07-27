import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { POX5_DEVNET_API_URL } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Money } from '@leather.io/models';
import {
  createGetCoreInfoQueryOptions,
  createGetPoxInfoQueryOptions,
  createGetSecondsUntilNextCycleQueryOptions,
  createGetStxAddressBalanceQueryOptions,
} from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { usePox5StackingClientRequired, usePox5StacksClient } from '../hooks/use-pox5-clients';

// Node-info queries for the pox-5 devnet. These mirror the pox-4
// hooks in features/stacking/hooks/stacking.query.ts but run against the
// pinned pox-5 clients, so cycle clocks, burn heights, and balances reflect
// the chain transactions are actually sent to.
export function usePox5PoxInfoQuery() {
  const client = usePox5StackingClientRequired();
  return useQuery(createGetPoxInfoQueryOptions({ client }));
}

export function usePox5CoreInfoQuery() {
  const client = usePox5StackingClientRequired();
  return useQuery(createGetCoreInfoQueryOptions({ client }));
}

export function usePox5SecondsUntilNextCycleQuery() {
  const client = usePox5StackingClientRequired();
  return useQuery(createGetSecondsUntilNextCycleQueryOptions({ client }));
}

interface UsePox5AvailableUnlockedBalanceResult {
  isLoading: boolean;
  availableBalance: Money;
}

// The pox-4 flow's mempool-adjusted balance filtering queries the app-selected
// network, so it cannot be reused here; the plain unlocked balance from the
// devnet is used instead.
export function usePox5AvailableUnlockedBalance(
  address: string
): UsePox5AvailableUnlockedBalanceResult {
  const client = usePox5StacksClient();

  const balanceQuery = useQuery(
    createGetStxAddressBalanceQueryOptions({
      address,
      client,
      network: POX5_DEVNET_API_URL,
    })
  );

  const resp = balanceQuery.data;
  const unlocked = resp ? new BigNumber(resp.balance).minus(new BigNumber(resp.locked)) : null;

  return {
    isLoading: balanceQuery.isLoading,
    availableBalance: createMoney(unlocked ?? new BigNumber(0), 'STX'),
  };
}
