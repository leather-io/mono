import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PQueue from 'p-queue';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';

const queryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

async function fetchInscriptionTextContent(src: string) {
  const res = await axios.get(src, { responseType: 'text' });
  return res.data;
}

interface CreateGetInscriptionTextContentQueryOptionsArgs {
  contentSrc: string;
  limiter: PQueue;
}
export function createGetInscriptionTextContentQueryOptions({
  contentSrc,
  limiter,
}: CreateGetInscriptionTextContentQueryOptionsArgs) {
  return {
    queryKey: [BitcoinQueryPrefixes.GetInscriptionTextContent, contentSrc],
    queryFn: () =>
      limiter.add(() => fetchInscriptionTextContent(contentSrc), {
        throwOnTimeout: true,
      }),
    ...queryOptions,
  } as const;
}

export function useGetInscriptionTextContentQuery(contentSrc: string) {
  const limiter = useBestInSlotApiRateLimiter();
  return useQuery({
    queryKey: [BitcoinQueryPrefixes.GetInscriptionTextContent, contentSrc],
    queryFn: async () => {
      return limiter.add(() => fetchInscriptionTextContent(contentSrc), {
        throwOnTimeout: true,
      });
    },
    ...queryOptions,
  });
}
