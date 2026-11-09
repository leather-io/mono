import { type HttpCacheKey, httpCacheConfig } from './http-cache.config';

export interface HttpCacheOptions {
  ttl?: number;
}

interface FetchWithCacheOptions extends HttpCacheOptions {
  skipCache?: boolean;
}

export type HttpCacheKeyArray = [HttpCacheKey, ...unknown[]];

export abstract class HttpCacheService {
  static readonly CACHE_KEY_PREFIX = 'http-';

  fetchWithCache<T>(
    key: HttpCacheKeyArray,
    fetchFn: () => Promise<T>,
    { skipCache, ...options }: FetchWithCacheOptions = {}
  ): Promise<T> {
    if (skipCache) return fetchFn();
    return this.fetchWithCacheInternal(this.addCachePrefix(key), fetchFn, {
      ...httpCacheConfig[key[0]],
      ...options,
    });
  }

  clear(cacheKey: HttpCacheKey): Promise<void> {
    return this.clearInternal(HttpCacheService.CACHE_KEY_PREFIX + cacheKey);
  }

  abstract fetchWithCacheInternal<T>(
    key: unknown[],
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T>;

  abstract clearInternal(cacheKey: string): Promise<void>;

  private addCachePrefix(key: HttpCacheKeyArray) {
    return [HttpCacheService.CACHE_KEY_PREFIX + key[0], ...key.slice(1)];
  }
}
