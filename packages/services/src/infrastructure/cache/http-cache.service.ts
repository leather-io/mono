import { HttpCacheKey, httpCacheConfig } from './http-cache.config';

export interface HttpCacheOptions {
  ttl?: number;
}

export type HttpCacheKeyArray = [HttpCacheKey, ...unknown[]];

export abstract class HttpCacheService {
  static readonly CACHE_KEY_PREFIX = 'http-';

  fetchWithCache<T>(
    key: HttpCacheKeyArray,
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T> {
    return this.fetchWithCacheInternal(
      this.addCachePrefix(key),
      fetchFn,
      options ?? httpCacheConfig[key[0]]
    );
  }

  abstract fetchWithCacheInternal<T>(
    key: unknown[],
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T>;

  private addCachePrefix(key: HttpCacheKeyArray) {
    return [HttpCacheService.CACHE_KEY_PREFIX + key[0], ...key.slice(1)];
  }
}
