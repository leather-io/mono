import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { HIRO_INSCRIPTIONS_API_URL } from '@leather.io/models';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { AppUseQueryConfig } from '../../query-config';
import { BitcoinQueryPrefixes } from '../../query-prefixes';

const inscriptionQueryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

/**
 * @param path - inscription/:inscription_id
 */
function fetchInscription() {
  return async (id: string) => {
    const res = await axios.get(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
    return res.data as InscriptionResponseHiro;
  };
}

type FetchInscriptionResp = Awaited<ReturnType<ReturnType<typeof fetchInscription>>>;

export function useGetInscriptionQuery<T extends unknown = FetchInscriptionResp>(
  id: string,
  options?: AppUseQueryConfig<FetchInscriptionResp, T>
) {
  return useQuery({
    enabled: !!id,
    queryKey: [BitcoinQueryPrefixes.InscriptionMetadata, id],
    queryFn: () => fetchInscription()(id),
    ...inscriptionQueryOptions,
    ...options,
  });
}
