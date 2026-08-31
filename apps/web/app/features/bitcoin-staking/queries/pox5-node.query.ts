import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { CYCLE_STATUS_REFETCH_INTERVAL_MS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Money } from '@leather.io/models';
import {
  createGetCoreInfoQueryOptions,
  createGetPoxInfoQueryOptions,
  createGetSecondsUntilNextCycleQueryOptions,
  createGetStxAddressBalanceQueryOptions,
} from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { usePox5ChainStackingClient, usePox5StacksClient } from '../hooks/use-pox5-clients';

// Node-info queries for the configured pox-5 chain. These mirror the pox-4
// hooks in features/stacking/hooks/stacking.query.ts but run against the
// pinned pox-5 clients, so cycle clocks, burn heights, and balances reflect
// the chain transactions are actually sent to.
// Burn blocks land roughly every ten minutes, so a one-minute refetch keeps the
// cycle clock honest without the user reloading. Without it the page can keep
// claiming staking is paused long after the prepare phase ended, and gate
// actions that the contract would now accept.
export function usePox5PoxInfoQuery() {
  const client = usePox5ChainStackingClient();
  return useQuery({
    ...createGetPoxInfoQueryOptions({ client }),
    refetchInterval: CYCLE_STATUS_REFETCH_INTERVAL_MS,
  });
}

export function usePox5CoreInfoQuery() {
  const client = usePox5ChainStackingClient();
  return useQuery({
    ...createGetCoreInfoQueryOptions({ client }),
    refetchInterval: CYCLE_STATUS_REFETCH_INTERVAL_MS,
  });
}

export function usePox5SecondsUntilNextCycleQuery() {
  const client = usePox5ChainStackingClient();
  return useQuery({
    ...createGetSecondsUntilNextCycleQueryOptions({ client }),
    refetchInterval: CYCLE_STATUS_REFETCH_INTERVAL_MS,
  });
}

interface UsePox5AvailableUnlockedBalanceResult {
  isLoading: boolean;
  availableBalance: Money;
}

// The pox-4 flow's mempool-adjusted balance filtering queries the app-selected
// network, so it cannot be reused here; the plain unlocked balance from the
// pinned pox-5 chain is used instead.
export function usePox5AvailableUnlockedBalance(
  address: string
): UsePox5AvailableUnlockedBalanceResult {
  const client = usePox5StacksClient();

  const balanceQuery = useQuery(
    createGetStxAddressBalanceQueryOptions({
      address,
      client,
      network: pox5NetworkConfig.apiUrl,
    })
  );

  const resp = balanceQuery.data;
  const unlocked = resp ? new BigNumber(resp.balance).minus(new BigNumber(resp.locked)) : null;

  return {
    isLoading: balanceQuery.isLoading,
    availableBalance: createMoney(unlocked ?? new BigNumber(0), 'STX'),
  };
}
