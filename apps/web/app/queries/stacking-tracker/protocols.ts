import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { STACKING_TRACKER_API_URL } from '~/constants/constants';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

async function fetchTokens(): Promise<StackingTrackerTokensResponse> {
  const { data } = await axios.get<StackingTrackerTokensResponse>(
    `${STACKING_TRACKER_API_URL}/tokens`
  );
  return data;
}

export function useStackingTrackerProtocols() {
  return useQuery({
    queryKey: ['stacking-tracker-protocols'],
    queryFn: fetchTokens,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useStackingTrackerProtocol(slug?: ProtocolSlug | null) {
  const protocols = useStackingTrackerProtocols();
  const stackingTrackerProtocolSlug = slug && protocolSlugToStackingTrackerSlug[slug];

  return useMemo(() => {
    if (!stackingTrackerProtocolSlug || !protocols.data) {
      return { ...protocols, data: null };
    }

    const currentEntity = protocols.data.entities.find(
      ({ slug }) => slug === stackingTrackerProtocolSlug
    );

    if (!currentEntity) {
      return { ...protocols, data: null };
    }

    const poolCycles = protocols.data.cycles
      .map(({ tokens, ...restCycle }) => ({
        ...restCycle,
        token: tokens.find(({ name }) => name === currentEntity.name),
      }))
      .filter((cycle): cycle is StackingTrackerCycleWithOnePool => !!cycle.token);

    const lastCycle =
      poolCycles.at(-1)?.cycle_number === protocols.data.cycles.at(-1)?.cycle_number
        ? poolCycles.at(-1)
        : undefined;

    const poolData = {
      entity: currentEntity,
      cycles: poolCycles,
      lastCycle,
    };

    return { ...protocols, data: poolData };
  }, [protocols, stackingTrackerProtocolSlug]);
}

const protocolSlugToStackingTrackerSlug: Record<ProtocolSlug, string | null> = {
  'stacking-dao': 'stackingdao',
  lisa: 'lisa',
};

export interface StackingTrackerToken {
  address: string;
  name: string;
  stacked_amount: number;
  rewards_amount: number;
  apr: number;
  apy: number;
}

export interface StackingTrackerTokenCycle {
  cycle_number: number;
  tokens: StackingTrackerToken[];
  stacked_amount: number;
  rewards_amount: number;
  stacked_amount_usd: number;
  rewards_amount_usd: number;
}

export interface StackingTrackerCycleWithOnePool extends Omit<StackingTrackerTokenCycle, 'tokens'> {
  token: StackingTrackerToken;
}

export interface StackingTrackerTokenEntity {
  name: string;
  entity: string;
  logo: string;
  logo_token: string;
  slug: string;
  website: string;
  stacked_amount: number;
  rewards_amount: number;
  stacked_amount_usd: number;
  rewards_amount_usd: number;
  apr: number;
  apy: number;
  token_supply: number;
  token_mcap: number;
}

export interface StackingTrackerTokensResponse {
  cycles: StackingTrackerTokenCycle[];
  entities: StackingTrackerTokenEntity[];
}
