import { queryClient } from '@/queries/query';

import { HttpCacheOptions, HttpCacheService } from '@leather.io/services';

export class MobileHttpCacheService extends HttpCacheService {
  async fetchWithCacheInternal<T>(
    key: unknown[],
    fetchFn: () => Promise<T>,
    options: HttpCacheOptions = {}
  ): Promise<T> {
    return queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: options.ttl ?? 0,
      gcTime: options.ttl ?? 0,
      retry: false,
    });
  }
}
