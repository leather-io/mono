import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getSip10AssetService } from '@leather.io/services';

export function useSip10FtMetadata(principal: string) {
  return useQuery({
    queryKey: ['sip10-ft-metadata', principal],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10AssetService().getAssetByPrincipal(principal, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 60000,
    gcTime: 1 * 60000,
  });
}
