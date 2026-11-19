import { afterEach, describe, expect, test, vi } from 'vitest';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { defaultNetworksKeyedById } from '@leather.io/models';

import type { Environment } from '../../environment';
import { RateLimiterService, type RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiError } from './leather-api.error';
import { OnramperWidgetSignatureClient } from './onramper-widget-signature.client';

const widgetParams = { apiKey: 'api-key', wallets: 'btc:bc1qexample', mode: 'buy' };

const widgetSignature = {
  sigV2: 'v2:signature',
  sigV2Timestamp: '1763553600',
  sigV2Nonce: 'nonce',
  sigV2Fields: 'apiKey,wallets,mode',
  endUserIpHash: 'a'.repeat(64),
};

class ImmediateRateLimiterService extends RateLimiterService {
  override add<T>(_type: RateLimiterType, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

const settingsService: SettingsService = {
  getSettings() {
    return {
      network: defaultNetworksKeyedById.mainnet,
      quoteCurrency: 'USD',
      assetVisibility: {},
    };
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function stubFetch(response: () => Response) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return Promise.resolve(response());
    })
  );
  return calls;
}

function createClient(environment: Environment) {
  return new OnramperWidgetSignatureClient(
    environment,
    new ImmediateRateLimiterService(settingsService)
  );
}

describe(OnramperWidgetSignatureClient.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('posts the widget params to the production API', async () => {
    const calls = stubFetch(() => jsonResponse(widgetSignature));
    const client = createClient({ environment: 'production', leatherApiUrl: 'https://ignored' });

    const result = await client.signWidgetParams(widgetParams);

    expect(result).toEqual(widgetSignature);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/onramp/widget-signature`);
    expect(calls[0].init?.method).toBe('POST');
    expect(calls[0].init?.body).toBe(JSON.stringify({ params: widgetParams }));
  });

  test('falls back to the staging API outside production', async () => {
    const calls = stubFetch(() => jsonResponse(widgetSignature));
    const client = createClient({ environment: 'development' });

    await client.signWidgetParams(widgetParams);

    expect(calls[0].url).toBe(`${LEATHER_API_URL_STAGING}/v1/onramp/widget-signature`);
  });

  test('uses the configured API URL outside production', async () => {
    const calls = stubFetch(() => jsonResponse(widgetSignature));
    const client = createClient({
      environment: 'development',
      leatherApiUrl: 'http://localhost:8787',
    });

    await client.signWidgetParams(widgetParams);

    expect(calls[0].url).toBe('http://localhost:8787/v1/onramp/widget-signature');
  });

  test('rejects a malformed end-user IP hash', async () => {
    stubFetch(() => jsonResponse({ ...widgetSignature, endUserIpHash: 'A'.repeat(64) }));
    const client = createClient({ environment: 'production' });

    await expect(client.signWidgetParams(widgetParams)).rejects.toBeInstanceOf(LeatherApiError);
  });

  test('rejects a signature that is not V2', async () => {
    stubFetch(() => jsonResponse({ ...widgetSignature, sigV2: 'signature' }));
    const client = createClient({ environment: 'production' });

    await expect(client.signWidgetParams(widgetParams)).rejects.toBeInstanceOf(LeatherApiError);
  });

  test('throws a LeatherApiError on a failed request', async () => {
    stubFetch(() => jsonResponse({ error: 'Signing unavailable' }, 500));
    const client = createClient({ environment: 'production' });

    await expect(client.signWidgetParams(widgetParams)).rejects.toMatchObject({
      status: 500,
      data: { error: 'Signing unavailable' },
    });
  });
});
