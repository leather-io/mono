import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryPrefixes } from '../../query-prefixes';
import { useHiroApiRateLimiter } from '../../rate-limiter/hiro-rate-limiter';

const queryOptions = {
  staleTime: Infinity,
  gcTime: Infinity,
} as const;

async function getInscriptionTextContent(src: string) {
  const res = await axios.get(src, { responseType: 'text' });
  return res.data;
}

export function useInscriptionTextContentQuery(contentSrc: string) {
  const limiter = useHiroApiRateLimiter();
  return useQuery({
    queryKey: [QueryPrefixes.OrdinalTextContent, contentSrc],
    queryFn: async () => {
      return limiter.add(() => getInscriptionTextContent(contentSrc), {
        throwOnTimeout: true,
      });
    },
    ...queryOptions,
  });
}
