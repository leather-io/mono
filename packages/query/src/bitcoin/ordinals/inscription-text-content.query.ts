import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { QueryPrefixes } from '../../query-prefixes';

async function getInscriptionTextContent(src: string) {
  const res = await axios.get(src, { responseType: 'text' });
  return res.data;
}

export function useInscriptionTextContentQuery(contentSrc: string) {
  const limiter = useHiroApiRateLimiter();
  return useQuery(
    [QueryPrefixes.OrdinalTextContent, contentSrc],
    async () => {
      return limiter.add(() => getInscriptionTextContent(contentSrc), {
        throwOnTimeout: true,
      });
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}
