import { describe, expect, test, vi } from 'vitest';

import { minutesInMs } from '@leather.io/utils';

import { type HttpCacheOptions, HttpCacheService } from './http-cache.service';

class RecordingHttpCacheService extends HttpCacheService {
  calls: { key: unknown[]; options?: HttpCacheOptions }[] = [];

  fetchWithCacheInternal<T>(
    key: unknown[],
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T> {
    this.calls.push({ key, options });
    return fetchFn();
  }

  clearInternal(): Promise<void> {
    return Promise.resolve();
  }
}

describe(HttpCacheService.name, () => {
  test('caches with the configured ttl for the key', async () => {
    const cache = new RecordingHttpCacheService();

    await cache.fetchWithCache(['bns-v2-api-name', 'name.btc'], () => Promise.resolve('value'));

    expect(cache.calls).toEqual([
      { key: ['http-bns-v2-api-name', 'name.btc'], options: { ttl: minutesInMs(2) } },
    ]);
  });

  test('bypasses the cache when skipCache is set', async () => {
    const cache = new RecordingHttpCacheService();
    const fetchFn = vi.fn(() => Promise.resolve('value'));

    const result = await cache.fetchWithCache(['bns-v2-api-name', 'name.btc'], fetchFn, {
      skipCache: true,
    });

    expect(result).toBe('value');
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(cache.calls).toEqual([]);
  });

  test('keeps the configured ttl when skipCache is false', async () => {
    const cache = new RecordingHttpCacheService();

    await cache.fetchWithCache(['bns-v2-api-name', 'name.btc'], () => Promise.resolve('value'), {
      skipCache: false,
    });

    expect(cache.calls[0]?.options).toEqual({ ttl: minutesInMs(2) });
  });
});
