import { afterEach, describe, expect, test, vi } from 'vitest';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';

import type { Environment } from '../../environment';
import { RateLimiterService, type RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiError, getErrorDetail } from './leather-api.error';
import { LeatherSponsorshipApiClient } from './leather-sponsorship-api.client';
import {
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipIneligibilityReason,
} from './leather-sponsorship-api.types';

const quoteRequest = {
  network: 'mainnet',
  origin: 'SP1ORIGIN',
} as const;

const quoteResponse = {
  sponsorPrincipal: 'SP3SPONSOR',
  feeRecipientPrincipal: 'SP4FEES',
  expiresAt: '2026-09-21T12:00:00.000Z',
  tiers: {
    low: { quoteId: 'quote-low', feeSats: 1000, stxFeeMicro: 120_000 },
    medium: { quoteId: 'quote-medium', feeSats: 1500, stxFeeMicro: 180_000 },
    high: { quoteId: 'quote-high', feeSats: 3000, stxFeeMicro: 360_000 },
  },
};

class ImmediateRateLimiterService extends RateLimiterService {
  override add<T>(_type: RateLimiterType, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

const settingsService: SettingsService = {
  getSettings() {
    throw new Error('Settings should not be read in this test');
  },
};

function createClient(environment: Environment = { environment: 'production' }) {
  return new LeatherSponsorshipApiClient(
    environment,
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

  test('posts the quote request to the production API and parses the response', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createClient().fetchQuote(quoteRequest);

    expect(result).toEqual(quoteResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/quote`);
    expect(init?.method).toBe('POST');
    expect(typeof init?.body === 'string' ? JSON.parse(init.body) : undefined).toEqual(
      quoteRequest
    );
    expect(new Headers(init?.headers).get('X-Client-ID')).toBeTruthy();
  });

  test('targets staging outside production', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient({ environment: 'development' }).fetchQuote(quoteRequest);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_STAGING}/v1/sponsorship/quote`);
  });

  test('treats an explicit sponsorship API URL as the base that serves quote and submit', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse(quoteResponse))
    );
    vi.stubGlobal('fetch', fetchMock);

    await createClient({
      environment: 'production',
      sponsorshipApiUrl: 'http://localhost:8791/',
    }).fetchQuote(quoteRequest);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8791/quote');
  });

  test('submits the signed transaction and returns txid plus the sponsored hex', async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(() =>
      Promise.resolve(jsonResponse({ txid: 'abc', transaction: '00deadbeef' }))
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createClient().submitTransaction({
      quoteId: 'quote-1',
      transaction: '00cafe',
    });

    expect(result).toEqual({ txid: 'abc', transaction: '00deadbeef' });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/submit`);
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

  test('rejects a malformed success body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({ sponsorPrincipal: 1 })))
    );

    await expect(createClient().fetchQuote(quoteRequest)).rejects.toThrow();
  });

  test('rejects a quote without the per-tier quotes', async () => {
    const legacyQuote = {
      ...quoteResponse,
      quoteId: 'quote-medium',
      feeSats: 1500,
      stxFeeMicro: 180_000,
      tiers: undefined,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(legacyQuote)))
    );

    await expect(createClient().fetchQuote(quoteRequest)).rejects.toThrow();
  });
});

describe(getSbtcSponsorshipErrorCode.name, () => {
  test('returns undefined for unknown codes, code-less bodies and non-API errors', () => {
    expect(getSbtcSponsorshipErrorCode(new Error('boom'))).toBeUndefined();
    expect(
      getSbtcSponsorshipErrorCode(new LeatherApiError('u', 400, 'x', { error: 'Bad Request' }))
    ).toBeUndefined();
    expect(
      getSbtcSponsorshipErrorCode(
        new LeatherApiError('u', 500, 'x', { error: 'boom', code: 'something_else' })
      )
    ).toBeUndefined();
  });

  test('recognises the coded upstream failure', () => {
    expect(
      getSbtcSponsorshipErrorCode(
        new LeatherApiError('u', 502, 'x', {
          error: 'Stacks API unavailable',
          code: 'upstream_unavailable',
        })
      )
    ).toBe('upstream_unavailable');
  });
});
