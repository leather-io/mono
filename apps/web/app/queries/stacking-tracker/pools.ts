import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { STACKING_TRACKER_API_URL } from '~/constants/constants';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';

async function fetchPools() {
  const { data } = await axios.get<StackingTrackerPoolsResponse>(
    `${STACKING_TRACKER_API_URL}/pools`
  );
  return data;
}

function useStackingTrackerPools() {
  return useQuery({
    queryKey: ['stacking-tracker-pools'],
    queryFn: fetchPools,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useStackingTrackerPool(slug?: PoolSlug | null) {
  const pools = useStackingTrackerPools();
  const stackingTrackerPoolSlug = slug && poolSlugToStackingTrackerSlug[slug];

  return useMemo(() => {
    if (!stackingTrackerPoolSlug || !pools.data) {
      return { ...pools, data: null };
    }

    const currentEntity = pools.data.entities.find(({ slug }) => slug === stackingTrackerPoolSlug);

    if (!currentEntity) {
      return { ...pools, data: null };
    }

    const poolCycles = pools.data.cycles
      .map(({ pools, ...restCycle }) => ({
        ...restCycle,
        pool: pools.find(({ name }) => name === currentEntity.name),
      }))
      .filter((cycle): cycle is StackingTrackerCycleWithOnePool => !!cycle.pool);

    const lastCycle =
      poolCycles.at(-1)?.cycle_number === pools.data.cycles.at(-1)?.cycle_number
        ? poolCycles.at(-1)
        : undefined;

    const poolData = {
      entity: currentEntity,
      cycles: poolCycles,
      lastCycle,
    };

    return { ...pools, data: poolData };
  }, [pools, stackingTrackerPoolSlug]);
}

const poolSlugToStackingTrackerSlug: Record<PoolSlug, string | null> = {
  'fast-pool': 'fast-pool',
  'fast-pool-v2': 'fast-pool-v2',
  planbetter: 'planbetter-pool',
  'stacking-dao': 'stackingdao-pool',
  'xverse-pool': 'xverse-pool',
  restake: null,
};

interface StackingTrackerPool {
  name: string;
  stackers_count: number;
  pox_address?: string;
  stacked_amount: number;
  rewards_amount: number;
  apr?: number;
  apy?: number;
  stacked_amount_usd?: number;
  rewards_amount_usd?: number;
}

interface StackingTrackerPoolCycle {
  cycle_number: number;
  stacked_amount: number;
  rewards_amount: number;
  stacked_amount_usd: number;
  rewards_amount_usd: number;
  pools: StackingTrackerPool[];
}

interface StackingTrackerCycleWithOnePool extends Omit<StackingTrackerPoolCycle, 'pools'> {
  pool: StackingTrackerPool;
}

interface StackingTrackerPoolEntity {
  name: string;
  fee: number;
  feeDisclosed: boolean;
  logo: string;
  website: string;
  symbol: string;
  slug: string;
  stackers_count: number;
  stacked_amount: number;
  rewards_amount: number;
  stacked_amount_usd: number;
  rewards_amount_usd: number;
  apr: number | null;
  apy: number | null;
}

interface StackingTrackerPoolsResponse {
  cycles: StackingTrackerPoolCycle[];
  entities: StackingTrackerPoolEntity[];
}
