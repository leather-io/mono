import { useQueries, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { createCryptoAssetBalance } from '@leather-wallet/models';
import { createMoney, getPrincipalFromContractId, getTicker } from '@leather-wallet/utils';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { AddressBalanceResponse } from '../../hiro-api-types';
import { createSip10CryptoAssetInfo } from '../../sip10/sip10-tokens.utils';
import { type StacksClient, useStacksClient } from '../../stacks-client';
import { getStacksContractIdStringParts } from '../../temp-utils';
import { FtAssetResponse, isFtAsset } from '../token-metadata.utils';

const staleTime = 12 * 60 * 60 * 1000;

const queryOptions = {
  gcTime: staleTime,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,
  staleTime,
};

function fetchFungibleTokenMetadata(client: StacksClient) {
  return (principal: string) => client.getFtMetadata(principal) as unknown as FtAssetResponse;
}

export function useGetFungibleTokenMetadataQuery(principal: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
    queryFn: () => fetchFungibleTokenMetadata(client)(principal),
    ...queryOptions,
  });
}

export function useGetFungibleTokensBalanceMetadataQuery(
  ftBalances: AddressBalanceResponse['fungible_tokens']
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQueries({
    queries: Object.entries(ftBalances).map(([key, value]) => {
      const principal = getPrincipalFromContractId(key);
      return {
        enabled: !!principal,
        queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
        queryFn: () => fetchFungibleTokenMetadata(client)(principal),
        select: (resp: FtAssetResponse) => {
          if (!(resp && isFtAsset(resp))) return;
          const { contractAssetName } = getStacksContractIdStringParts(key);
          const name = resp.name || contractAssetName;
          const symbol = resp.symbol || getTicker(name);
          return {
            contractId: key,
            balance: createCryptoAssetBalance(
              createMoney(new BigNumber(value.balance), symbol, resp.decimals ?? 0)
            ),
          };
        },
        ...queryOptions,
      };
    }),
  });
}

export function useGetFungibleTokensMetadataQuery(keys: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQueries({
    queries: keys.map(key => {
      const principal = getPrincipalFromContractId(key);
      return {
        enabled: !!principal,
        queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
        queryFn: () => fetchFungibleTokenMetadata(client)(principal),
        select: (resp: FtAssetResponse) => {
          if (!(resp && isFtAsset(resp))) return;
          return createSip10CryptoAssetInfo(key, resp);
        },
        ...queryOptions,
      };
    }),
  });
}
