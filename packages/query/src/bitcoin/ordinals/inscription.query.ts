import { useQuery } from '@tanstack/react-query';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BestInSlotApi } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';

const queryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

export function createGetInscriptionQueryOptions(
  id: string,
  bestInSlotApi: ReturnType<typeof BestInSlotApi>
) {
  return {
    enabled: !!id,
    queryKey: [BitcoinQueryPrefixes.GetInscription, id],
    queryFn: () => bestInSlotApi.getInscriptionById(id),
    ...queryOptions,
  } as const;
}

export function useGetInscriptionQuery(id: string) {
  const client = useBitcoinClient();
  return useQuery(createGetInscriptionQueryOptions(id, client.BestInSlotApi));
}
