import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';

const queryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

async function getInscriptionTextContent(src: string) {
  const res = await axios.get(src, { responseType: 'text' });
  return res.data;
}

export function useInscriptionTextContentQuery(contentSrc: string) {
  const limiter = useBestInSlotApiRateLimiter();
  return useQuery({
    queryKey: [BitcoinQueryPrefixes.OrdinalTextContent, contentSrc],
    queryFn: async () => {
      return limiter.add(() => getInscriptionTextContent(contentSrc), {
        throwOnTimeout: true,
      });
    },
    ...queryOptions,
  });
}
