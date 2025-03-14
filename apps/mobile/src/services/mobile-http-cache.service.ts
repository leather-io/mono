import { queryClient } from '@/queries/query';
import { QueryKey } from '@tanstack/react-query';

import { HttpCacheKey, HttpCacheOptions, HttpCacheService } from '@leather.io/services';

export class MobileHttpCacheService implements HttpCacheService {
  async fetchWithCache<T>(
    key: HttpCacheKey,
    fetchFn: () => Promise<T>,
    options: HttpCacheOptions = {}
  ): Promise<T> {
    return queryClient.fetchQuery({
      queryKey: key as QueryKey,
      queryFn: fetchFn,
      staleTime: options.ttl ?? 0,
      gcTime: options.ttl ?? 0,
      retry: false,
    });
  }
}
