import { afterEach, describe, expect, test, vi } from 'vitest';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';

import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';
import { RateLimiterService, type RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiClient } from './leather-api.client';

const proposalRequest = {
  multisigAddress: 'multisig-address',
  rawPayload: 'raw-payload',
  proposalSignature: 'proposal-signature',
  proposalTimestamp: 1,
};

class PassthroughHttpCacheService extends HttpCacheService {
  fetchWithCacheInternal<T>(_key: unknown[], fetchFn: () => Promise<T>): Promise<T> {
    return fetchFn();
  }

  clearInternal(): Promise<void> {
    return Promise.resolve();
  }
}

class ImmediateRateLimiterService extends RateLimiterService {
  override add<T>(_type: RateLimiterType, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe(LeatherApiClient.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test('sends proposals to the production API when no base URL override is given', async () => {
    const requests: Request[] = [];
    const fetchMock = vi.fn((request: Request) => {
      requests.push(request);
      return Promise.resolve(jsonResponse({}));
    });
    vi.stubGlobal('fetch', fetchMock);

    const settingsService: SettingsService = {
      getSettings() {
        throw new Error('Settings should not be read in this test');
      },
    };
    const environment: Environment = {
      environment: 'production',
    };
    const client = new LeatherApiClient(
      new PassthroughHttpCacheService(),
      settingsService,
      environment,
      new ImmediateRateLimiterService(settingsService)
    );

    await client.proposeMultisigTransaction(proposalRequest);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/multisig-ext/propose`);
  });

  test('scopes a base URL override to the proposal request', async () => {
    const requests: Request[] = [];
    const fetchMock = vi.fn((request: Request) => {
      requests.push(request);
      return Promise.resolve(jsonResponse({}));
    });
    vi.stubGlobal('fetch', fetchMock);

    const settingsService: SettingsService = {
      getSettings() {
        throw new Error('Settings should not be read in this test');
      },
    };
    const environment: Environment = {
      environment: 'production',
    };
    const client = new LeatherApiClient(
      new PassthroughHttpCacheService(),
      settingsService,
      environment,
      new ImmediateRateLimiterService(settingsService)
    );

    await client.proposeMultisigTransaction(proposalRequest, {
      baseUrl: LEATHER_API_URL_STAGING,
    });
    await client.fetchProtocols({ skipCache: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requests.map(request => ({ method: request.method, url: request.url }))).toEqual([
      {
        method: 'POST',
        url: `${LEATHER_API_URL_STAGING}/v1/multisig-ext/propose`,
      },
      {
        method: 'GET',
        url: `${LEATHER_API_URL_PRODUCTION}/v1/protocols`,
      },
    ]);
  });
});
