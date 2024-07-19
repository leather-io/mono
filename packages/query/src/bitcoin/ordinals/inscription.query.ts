import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { HIRO_INSCRIPTIONS_API_URL } from '@leather.io/models';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { BitcoinQueryPrefixes } from '../../query-prefixes';

const queryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

/**
 * @param path - inscription/:inscription_id
 */
async function fetchInscription(id: string) {
  const res = await axios.get(`${HIRO_INSCRIPTIONS_API_URL}/${id}`);
  return res.data as InscriptionResponseHiro;
}

export function createGetInscriptionQueryOptions(id: string) {
  return {
    enabled: !!id,
    queryKey: [BitcoinQueryPrefixes.GetInscription, id],
    queryFn: () => fetchInscription(id),
    ...queryOptions,
  } as const;
}

export function useGetInscriptionQuery(id: string) {
  return useQuery(createGetInscriptionQueryOptions(id));
}
