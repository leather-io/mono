import { afterEach, describe, expect, test, vi } from 'vitest';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { defaultNetworksKeyedById } from '@leather.io/models';

import { HttpCacheService } from '../../cache/http-cache.service';
import type { Environment } from '../../environment';
import { RateLimiterService, type RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiClient, type LeatherApiStakingBond } from './leather-api.client';
import { LeatherApiError, getErrorDetail } from './leather-api.error';
import {
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipIneligibilityReason,
} from './leather-sponsorship-api.types';

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createClient(
  network: (typeof defaultNetworksKeyedById)[keyof typeof defaultNetworksKeyedById]
) {
  const settingsService: SettingsService = {
    getSettings: () => ({ quoteCurrency: 'USD', network, assetVisibility: {} }),
  };
  return new LeatherApiClient(
    new PassthroughHttpCacheService(),
    settingsService,
    { environment: 'production' },
    new ImmediateRateLimiterService(settingsService)
  );
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

  describe('fetchStakingBonds', () => {
    const bond: LeatherApiStakingBond = {
      bondIndex: 4,
      stxAddress: 'SP1STAKER',
      enrollmentTxId: '0xenroll',
      registeredAtBurnHeight: 900_000,
      exitAnnouncedAtBurnHeight: null,
      outputs: [],
    };

    test('requests bonds for the chain of the current network', async () => {
      const requests: Request[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn((request: Request) => {
          requests.push(request);
          return Promise.resolve(jsonResponse({ bonds: [bond] }));
        })
      );

      const bonds = await createClient(defaultNetworksKeyedById.mainnet).fetchStakingBonds(
        'bc1qpayer'
      );

      expect(requests.map(request => request.url)).toEqual([
        `${LEATHER_API_URL_PRODUCTION}/v1/staking/addresses/bc1qpayer/bonds?chain=mainnet`,
      ]);
      expect(bonds).toEqual([bond]);
    });

    test('asks for spent bonds only when requested', async () => {
      const requests: Request[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn((request: Request) => {
          requests.push(request);
          return Promise.resolve(jsonResponse({ bonds: [] }));
        })
      );

      await createClient(defaultNetworksKeyedById.mainnet).fetchStakingBonds('bc1qpayer', {
        includeSpent: true,
      });

      expect(requests.map(request => request.url)).toEqual([
        `${LEATHER_API_URL_PRODUCTION}/v1/staking/addresses/bc1qpayer/bonds?chain=mainnet&include=spent`,
      ]);
    });

    test('returns no bonds without a request on networks the staking index does not cover', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const bonds = await createClient(defaultNetworksKeyedById.testnet).fetchStakingBonds(
        'tb1qpayer'
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(bonds).toEqual([]);
    });
  });

  describe('sBTC sponsorship', () => {
    const quote = {
      quoteId: 'quote-1',
      feeRecipientPrincipal: 'SP4FEES',
      expiresAt: '2026-09-21T12:00:00.000Z',
      satsPerStx: '512.5',
      minFeeSats: 1000,
      maxFeeSats: 50_000,
    };

    test('posts a bodyless quote request for the network of the current chain', async () => {
      const requests: Request[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn((request: Request) => {
          requests.push(request);
          return Promise.resolve(jsonResponse(quote));
        })
      );

      const result = await createClient(
        defaultNetworksKeyedById.testnet
      ).fetchSbtcSponsorshipQuote();

      expect(result).toEqual(quote);
      expect(requests).toHaveLength(1);
      expect(requests[0].method).toBe('POST');
      expect(requests[0].url).toBe(
        `${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/quote?network=testnet`
      );
      expect(requests[0].body).toBeNull();
      expect(requests[0].headers.get('X-Client-ID')).toBeTruthy();
    });

    test('refuses to call the API on a chain without a sponsorship service', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(
        createClient(defaultNetworksKeyedById.stakingTestnet).fetchSbtcSponsorshipQuote()
      ).rejects.toThrow('not available on this network');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('submits the signed transaction as JSON and returns txid plus the sponsored hex', async () => {
      const requests: Request[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn((request: Request) => {
          requests.push(request.clone());
          return Promise.resolve(jsonResponse({ txid: 'abc', transaction: '00deadbeef' }));
        })
      );

      const submitRequest = { quoteId: 'quote-1', transaction: '00cafe' };
      const result = await createClient(
        defaultNetworksKeyedById.mainnet
      ).submitSbtcSponsoredTransaction(submitRequest);

      expect(result).toEqual({ txid: 'abc', transaction: '00deadbeef' });
      expect(requests[0].url).toBe(
        `${LEATHER_API_URL_PRODUCTION}/v1/sponsorship/submit?network=mainnet`
      );
      expect(requests[0].headers.get('Content-Type')).toBe('application/json');
      expect(await requests[0].json()).toEqual(submitRequest);
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

      const error = await createClient(defaultNetworksKeyedById.mainnet)
        .submitSbtcSponsoredTransaction({ quoteId: 'quote-1', transaction: '00cafe' })
        .catch((e: unknown) => e);

      expect(LeatherApiError.isLeatherApiError(error)).toBe(true);
      expect(getSbtcSponsorshipErrorCode(error)).toBe('not_eligible');
      expect(getSbtcSponsorshipIneligibilityReason(error)).toBe('fee_too_low');
      expect(getErrorDetail(error)).toBe('fee entry below quote');
    });
  });
});
