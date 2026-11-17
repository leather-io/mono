import { afterEach, describe, expect, test, vi } from 'vitest';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import type { Environment } from '../../environment';
import { RateLimiterService, type RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiError, getErrorDetail } from './leather-api.error';
import { LeatherSponsorshipApiClient } from './leather-sponsorship-api.client';
import {
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipIneligibilityReason,
} from './leather-sponsorship-api.types';

const quoteResponse = {
  quoteId: 'quote-1',
  feeRecipientPrincipal: 'SP4FEES',
  expiresAt: '2026-09-21T12:00:00.000Z',
  satsPerStx: '512.5',
  minFeeSats: 1000,
  maxFeeSats: 50_000,
};

class ImmediateRateLimiterService extends RateLimiterService {
  override add<T>(_type: RateLimiterType, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

function createSettingsService(network: NetworkConfiguration): SettingsService {
  return {
    getSettings() {
      return { network, quoteCurrency: 'USD', assetVisibility: {} };
    },
  };
}

function createClient(
  environment: Environment = { environment: 'production' },
  network = defaultNetworksKeyedById.mainnet
) {
  const settingsService = createSettingsService(network);
  return new LeatherSponsorshipApiClient(
    environment,
    settingsService,
    new ImmediateRateLimiterService(settingsService)
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe(LeatherSponsorshipApiClient.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('posts a bodyless quote request to the production API and parses the response', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createClient().fetchQuote();

    expect(result).toEqual(quoteResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/quote?network=mainnet`);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBeUndefined();
    expect(new Headers(init?.headers).get('X-Client-ID')).toBeTruthy();
  });

  test('targets staging outside production', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient({ environment: 'development' }).fetchQuote();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_STAGING}/v1/sponsorship/quote?network=mainnet`);
  });

  test('treats an explicit sponsorship API URL as the base that serves quote and submit', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient({
      environment: 'production',
      sponsorshipApiUrl: 'http://localhost:8791/',
    }).fetchQuote();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8791/quote?network=mainnet');
  });

  test('sends the testnet network on a testnet chain', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient(
      { environment: 'production' },
      defaultNetworksKeyedById.testnet
    ).fetchQuote();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/quote?network=testnet`);
  });

  test('refuses to call the API on a chain without a sponsorship service', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createClient(
        { environment: 'production' },
        defaultNetworksKeyedById.stakingTestnet
      ).fetchQuote()
    ).rejects.toThrow('not available on this network');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('submits the signed transaction as JSON and returns txid plus the sponsored hex', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse({ txid: 'abc', transaction: '00deadbeef' }))
    );
    vi.stubGlobal('fetch', fetchMock);

    const submitRequest = { quoteId: 'quote-1', transaction: '00cafe' };
    const result = await createClient().submitTransaction(submitRequest);

    expect(result).toEqual({ txid: 'abc', transaction: '00deadbeef' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/submit?network=mainnet`);
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(typeof init?.body === 'string' ? JSON.parse(init.body) : undefined).toEqual(
      submitRequest
    );
  });

  test('throws a LeatherApiError carrying the typed error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(
            { error: 'fee entry below quote', code: 'not_eligible', reason: 'fee_too_low' },
            422
          )
        )
      )
    );

    const error = await createClient()
      .submitTransaction({ quoteId: 'quote-1', transaction: '00cafe' })
      .catch((e: unknown) => e);

    expect(LeatherApiError.isLeatherApiError(error)).toBe(true);
    expect(getSbtcSponsorshipErrorCode(error)).toBe('not_eligible');
    expect(getSbtcSponsorshipIneligibilityReason(error)).toBe('fee_too_low');
    expect(getErrorDetail(error)).toBe('fee entry below quote');
  });
});
