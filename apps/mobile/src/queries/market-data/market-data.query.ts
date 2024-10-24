import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { FungibleCryptoAssetInfo, NetworkModes } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createMarketDataQueryOptions(
  token: FungibleCryptoAssetInfo,
  network: NetworkModes
) {
  return {
    queryKey: ['market-data-service-get-market-data', network, token],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketDataService().getMarketData(token, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}

export function useMarketDataQuery(token: FungibleCryptoAssetInfo) {
  const { networkPreference } = useSettings();
  return useQuery(
    createMarketDataQueryOptions(
      token,
      bitcoinNetworkModeToCoreNetworkMode(networkPreference.chain.bitcoin.mode)
    )
  );
}

export function useMarketDataQueries(tokens: FungibleCryptoAssetInfo[]) {
  const { networkPreference } = useSettings();
  return useQueries({
    queries: tokens.map(token =>
      createMarketDataQueryOptions(
        token,
        bitcoinNetworkModeToCoreNetworkMode(networkPreference.chain.bitcoin.mode)
      )
    ),
  });
}
