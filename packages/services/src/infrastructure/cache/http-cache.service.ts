export type HttpCacheKey = readonly unknown[];

export interface HttpCacheOptions {
  ttl?: number;
}

export interface HttpCacheService {
  fetchWithCache<T>(
    key: HttpCacheKey,
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T>;
}
