import { HIRO_INSCRIPTIONS_API_URL } from '@leather-wallet/models';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { InscriptionResponseItem } from '../../../types/inscription';
import { AppUseQueryConfig } from '../../query-config';
import { QueryPrefixes } from '../../query-prefixes';

// TODO: Refactor with new models, include with PR #108
export interface Inscription extends InscriptionResponseItem {
  addressIndex: number;
}

const inscriptionQueryOptions = {
  staleTime: Infinity,
  cacheTime: Infinity,
} as const;

/**
 * @param path - inscription/:inscription_id
 */
function fetchInscription() {
  return async (id: string) => {
    const res = await axios.get(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
    return res.data as Inscription;
  };
}

type FetchInscriptionResp = Awaited<ReturnType<ReturnType<typeof fetchInscription>>>;

export function useGetInscriptionQuery<T extends unknown = FetchInscriptionResp>(
  id: string,
  options?: AppUseQueryConfig<FetchInscriptionResp, T>
) {
  return useQuery({
    enabled: !!id,
    queryKey: [QueryPrefixes.InscriptionMetadata, id],
    queryFn: () => fetchInscription()(id),
    ...inscriptionQueryOptions,
    ...options,
  });
}
