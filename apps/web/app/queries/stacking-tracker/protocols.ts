import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { STACKING_TRACKER_API_URL } from '~/constants/constants';

async function fetchTokens(): Promise<TokensResponse> {
  const { data } = await axios.get<TokensResponse>(`${STACKING_TRACKER_API_URL}/tokens`);
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

interface Token {
  address: string;
  name: string;
  stacked_amount: number;
  rewards_amount: number;
  apr: number;
  apy: number;
}

interface TokenCycle {
  cycle_number: number;
  tokens: Token[];
  stacked_amount: number;
  rewards_amount: number;
  stacked_amount_usd: number;
  rewards_amount_usd: number;
}

interface TokenEntity {
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

export interface TokensResponse {
  cycles: TokenCycle[];
  entities: TokenEntity[];
}
