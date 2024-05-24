import { createCryptoAssetBalance } from '@leather-wallet/models';
import { createMoney, getPrincipalFromContractId, getTicker } from '@leather-wallet/utils';
import { useQueries, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import PQueue from 'p-queue';

import { AddressBalanceResponse } from '../../../../types/account';
import { useHiroApiRateLimiter } from '../../../hiro-rate-limiter';
import { useCurrentNetworkState } from '../../../leather-query-provider';
import { createSip10CryptoAssetInfo } from '../../sip10/sip10-tokens.utils';
import { type StacksClient, useStacksClient } from '../../stacks-client';
import { getStacksContractIdStringParts } from '../../temp-utils';
import { FtAssetResponse, isFtAsset } from '../token-metadata.utils';

const staleTime = 12 * 60 * 60 * 1000;

const queryOptions = {
  keepPreviousData: true,
  cacheTime: staleTime,
  staleTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

function fetchFungibleTokenMetadata(client: StacksClient, limiter: PQueue) {
  return (principal: string) => async () => {
    return limiter.add(() => client.tokensApi.getFtMetadata(principal), {
      throwOnTimeout: true,
    }) as unknown as FtAssetResponse;
  };
}

export function useGetFungibleTokenMetadataQuery(principal: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQuery({
    queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
    queryFn: fetchFungibleTokenMetadata(client, limiter)(principal),
    ...queryOptions,
  });
}

export function useGetFungibleTokensBalanceMetadataQuery(
  ftBalances: AddressBalanceResponse['fungible_tokens']
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQueries({
    queries: Object.entries(ftBalances).map(([key, value]) => {
      const principal = getPrincipalFromContractId(key);
      return {
        enabled: !!principal,
        queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
        queryFn: fetchFungibleTokenMetadata(client, limiter)(principal),
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
  const limiter = useHiroApiRateLimiter();

  return useQueries({
    queries: keys.map(key => {
      const principal = getPrincipalFromContractId(key);
      return {
        enabled: !!principal,
        queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
        queryFn: fetchFungibleTokenMetadata(client, limiter)(principal),
        select: (resp: FtAssetResponse) => {
          if (!(resp && isFtAsset(resp))) return;
          return createSip10CryptoAssetInfo(key, resp);
        },
        ...queryOptions,
      };
    }),
  });
}
