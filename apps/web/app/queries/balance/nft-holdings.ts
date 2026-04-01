import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';

interface NftHoldingsResponse {
  total: number;
  limit: number;
  offset: number;
  results: NonFungibleTokenHolding[];
}

export async function fetchNftHoldings(
  baseUrl: string,
  address?: string
): Promise<NftHoldingsResponse> {
  const res = await fetchFn(`${baseUrl}/extended/v1/tokens/nft/holdings?principal=${address}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch NFT holdings: ${res.statusText}`);
  }
  return res.json();
}
