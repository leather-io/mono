import { NonFungibleTokenHolding } from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';
import { fetchFn } from '~/features/stacking/providers/fetch-fn';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

interface NftHoldingsResponse {
  total: number;
  limit: number;
  offset: number;
  results: NonFungibleTokenHolding[];
}

function createGetNftHoldingsQueryOptions(baseUrl: string, address?: string) {
  return {
    queryKey: ['nft-holdings', address, baseUrl],
    queryFn: async (): Promise<NftHoldingsResponse> => {
      const res = await fetchFn(`${baseUrl}/extended/v1/tokens/nft/holdings?principal=${address}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch NFT holdings: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!address,
  };
}

export function useNftHoldingsQuery() {
  const { networkPreference } = useStacksNetwork();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  return useQuery(
    createGetNftHoldingsQueryOptions(networkPreference.chain.stacks.url, stxAddress?.address)
  );
}
