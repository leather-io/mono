import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BestInSlotApi } from '../clients/best-in-slot';

const weekInMs = 1000 * 60 * 60 * 24 * 7;

const queryOptions = {
  staleTime: weekInMs,
  gcTime: weekInMs,
} as const;

interface CreateGetInscriptionsByParamQueryOptionsArgs {
  isPending?: boolean;
  param: string;
  BestInSlotApi: ReturnType<typeof BestInSlotApi>;
}
export function createGetInscriptionsByParamQueryOptions({
  isPending,
  param,
  BestInSlotApi,
}: CreateGetInscriptionsByParamQueryOptionsArgs) {
  return {
    enabled: !!param,
    queryKey: [BitcoinQueryPrefixes.GetInscriptionsByParam, isPending, param],
    queryFn: () => BestInSlotApi.getBatchInscriptionInfo([param]),
    ...queryOptions,
  } as const;
}
