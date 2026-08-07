import { defaultCurrentNetwork } from '@leather.io/models';
import {
  type HttpCacheOptions,
  HttpCacheService,
  type SettingsService,
  type UserSettings,
  initServicesContainer,
} from '@leather.io/services';

const defaultCacheTtlMs = 30_000;

class McpSettingsService implements SettingsService {
  getSettings(): UserSettings {
    return {
      network: defaultCurrentNetwork,
      quoteCurrency: 'USD',
      assetVisibility: {},
    };
  }
}

interface CacheEntry {
  promise: Promise<unknown>;
  expiresAt: number;
}

function launderCachedPromise<T>(promise: Promise<unknown>): Promise<T>;
function launderCachedPromise(promise: Promise<unknown>): Promise<unknown> {
  return promise;
}

class InMemoryHttpCacheService extends HttpCacheService {
  private readonly cache = new Map<string, CacheEntry>();

  async fetchWithCacheInternal<T>(
    key: unknown[],
    fetchFn: () => Promise<T>,
    options?: HttpCacheOptions
  ): Promise<T> {
    const cacheKey = JSON.stringify(key);
    const hit = this.cache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) return launderCachedPromise<T>(hit.promise);
    const promise = fetchFn();
    this.cache.set(cacheKey, {
      promise,
      expiresAt: Date.now() + (options?.ttl ?? defaultCacheTtlMs),
    });
    promise.catch(() => this.cache.delete(cacheKey));
    return promise;
  }

  clearInternal(cacheKey: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`["${cacheKey}"`)) this.cache.delete(key);
    }
    return Promise.resolve();
  }
}

export function initMcpServices() {
  initServicesContainer({
    env: { environment: 'production' },
    settingsService: McpSettingsService,
    cacheService: InMemoryHttpCacheService,
  });
}
