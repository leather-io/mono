import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AuthNetworkId, AuthSession } from '@leather.io/models';

import type { AuthSessionService } from '../../auth/auth-session.service';
import type { Environment } from '../../environment';
import type { RateLimiterService } from '../../rate-limiter/rate-limiter.service';
import { LeatherApiError } from './leather-api.error';
import { LeatherAuthApiClient } from './leather-auth-api.client';

const network: AuthNetworkId = 'btc:mainnet';

const meBody = {
  network,
  publicKey: 'pub',
  address: 'addr',
  id: 'user-1',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00Z',
  lastSeenAt: null,
};

function makeSession(accessToken: string, refreshToken = 'refresh-1'): AuthSession {
  return { accessToken, refreshToken, identity: { network, address: 'addr', publicKey: 'pub' } };
}

function jsonResponse(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function routeKey(url: string): 'auth' | 'refresh' | 'me' {
  if (url.includes('/v1/auth/refresh')) return 'refresh';
  if (url.includes('/v1/multisig/me')) return 'me';
  return 'auth';
}

type Responder = (req: Request) => Promise<Response> | Response;

interface HarnessOptions {
  session?: AuthSession | null;
}

function createHarness({ session = null }: HarnessOptions = {}) {
  let current = session;

  const sessions = {
    getSession: vi.fn(() => current),
    getActiveNetworks: vi.fn(() => (current ? [network] : [])),
    onTokenRefreshed: vi.fn(),
    onAuthFailure: vi.fn(),
  };

  const queues: Record<'auth' | 'refresh' | 'me', Responder[]> = {
    auth: [],
    refresh: [],
    me: [],
  };

  const fetchMock = vi.fn((req: Request) => {
    const key = routeKey(req.url);
    const responder = queues[key].shift();
    if (!responder) {
      throw new Error(`Unexpected ${req.method} ${req.url} (no queued ${key} response)`);
    }
    return responder(req);
  });
  vi.stubGlobal('fetch', fetchMock);

  const env = {
    environment: 'staging',
    leatherApiUrl: 'https://api.test',
  } as unknown as Environment;

  const rateLimiter = {
    add: (_type: unknown, fn: () => unknown) => fn(),
  } as unknown as RateLimiterService;

  const client = new LeatherAuthApiClient(
    sessions as unknown as AuthSessionService,
    env,
    rateLimiter
  );

  return {
    client,
    sessions,
    queues,
    fetchMock,
    setSession(next: AuthSession | null) {
      current = next;
    },
  };
}

describe(LeatherAuthApiClient.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('posts credentials to /v1/auth and returns the token pair', async () => {
    const h = createHarness();
    let request: Request | undefined;
    h.queues.auth.push(req => {
      request = req;
      return jsonResponse(200, { accessToken: 'access', refreshToken: 'refresh' });
    });

    const result = await h.client.authenticate({
      network,
      domain: 'https://app.leather.io',
      signature: 'sig',
      publicKey: 'pub',
      address: 'addr',
      timestamp: 1,
    });

    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    expect(request?.method).toBe('POST');
    expect(request?.url).toContain('/v1/auth');
  });

  it('throws LeatherApiError when /v1/auth responds non-2xx', async () => {
    const h = createHarness();
    h.queues.auth.push(() => jsonResponse(400, { error: 'bad signature' }));

    await expect(
      h.client.authenticate({
        network,
        domain: 'https://app.leather.io',
        signature: 'sig',
        publicKey: 'pub',
        address: 'addr',
        timestamp: 1,
      })
    ).rejects.toBeInstanceOf(LeatherApiError);
  });

  it('sends the bearer token and returns the identity on success', async () => {
    const h = createHarness({ session: makeSession('access-1') });
    let request: Request | undefined;
    h.queues.me.push(req => {
      request = req;
      return jsonResponse(200, meBody);
    });

    const result = await h.client.fetchMultisigMe(network);

    expect(result).toEqual(meBody);
    expect(request?.headers.get('authorization')).toBe('Bearer access-1');
    expect(h.sessions.onTokenRefreshed).not.toHaveBeenCalled();
  });

  it('refreshes on 401 and retries with the refreshed token, not the stale stored one', async () => {
    const h = createHarness({ session: makeSession('stale') });
    let retryRequest: Request | undefined;
    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
    h.queues.refresh.push(() => jsonResponse(200, { accessToken: 'fresh' }));
    h.queues.me.push(req => {
      retryRequest = req;
      return jsonResponse(200, meBody);
    });

    const result = await h.client.fetchMultisigMe(network);

    expect(result).toEqual(meBody);
    expect(h.sessions.onTokenRefreshed).toHaveBeenCalledWith(network, 'fresh');
    expect(retryRequest?.headers.get('authorization')).toBe('Bearer fresh');
  });

  it('signals auth failure and rethrows when the refresh call fails', async () => {
    const h = createHarness({ session: makeSession('stale') });
    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
    h.queues.refresh.push(() => jsonResponse(401, { error: 'dead refresh token' }));

    await expect(h.client.fetchMultisigMe(network)).rejects.toBeInstanceOf(LeatherApiError);
    expect(h.sessions.onAuthFailure).toHaveBeenCalledWith(network);
  });

  it('signals auth failure without attempting a refresh when no refresh token exists', async () => {
    const h = createHarness({
      session: { accessToken: 'stale', refreshToken: '', identity: makeSession('stale').identity },
    });
    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));

    await expect(h.client.fetchMultisigMe(network)).rejects.toBeInstanceOf(LeatherApiError);
    expect(h.sessions.onAuthFailure).toHaveBeenCalledWith(network);
    expect(h.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent 401s into a single refresh', async () => {
    const h = createHarness({ session: makeSession('stale') });
    let refreshCount = 0;
    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
    h.queues.refresh.push(() => {
      refreshCount += 1;
      return jsonResponse(200, { accessToken: 'fresh' });
    });
    h.queues.me.push(() => jsonResponse(200, meBody));
    h.queues.me.push(() => jsonResponse(200, meBody));

    const [a, b] = await Promise.all([
      h.client.fetchMultisigMe(network),
      h.client.fetchMultisigMe(network),
    ]);

    expect(a).toEqual(meBody);
    expect(b).toEqual(meBody);
    expect(refreshCount).toBe(1);
    expect(h.sessions.onTokenRefreshed).toHaveBeenCalledTimes(1);
  });

  it('does not apply a refresh result to a session that changed mid-flight', async () => {
    const h = createHarness({ session: makeSession('access-X', 'refresh-X') });
    let refreshStarted = false;
    let resolveRefresh!: (response: Response) => void;
    let retryRequest: Request | undefined;

    h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
    h.queues.refresh.push(() => {
      refreshStarted = true;
      return new Promise<Response>(resolve => {
        resolveRefresh = resolve;
      });
    });
    h.queues.me.push(req => {
      retryRequest = req;
      return jsonResponse(200, meBody);
    });

    const promise = h.client.fetchMultisigMe(network);
    await vi.waitFor(() => expect(refreshStarted).toBe(true));

    h.setSession(makeSession('access-Y', 'refresh-Y'));
    resolveRefresh(jsonResponse(200, { accessToken: 'fresh-X' }));

    const result = await promise;

    expect(result).toEqual(meBody);
    expect(h.sessions.onTokenRefreshed).not.toHaveBeenCalled();
    expect(retryRequest?.headers.get('authorization')).toBe('Bearer access-Y');
  });

  it('aborts a hung refresh on timeout, fails auth, and frees the single-flight slot', async () => {
    vi.useFakeTimers();
    try {
      const h = createHarness({ session: makeSession('stale') });
      h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
      h.queues.refresh.push(async req => {
        await new Promise<void>(resolve => {
          req.signal?.addEventListener('abort', () => resolve());
        });
        throw new Error('refresh aborted');
      });

      const promise = h.client.fetchMultisigMe(network);
      const assertion = expect(promise).rejects.toBeInstanceOf(LeatherApiError);
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(60_000);
      await assertion;
      expect(h.sessions.onAuthFailure).toHaveBeenCalledWith(network);

      vi.useRealTimers();

      h.setSession(makeSession('stale'));
      h.queues.me.push(() => jsonResponse(401, { error: 'expired' }));
      h.queues.refresh.push(() => jsonResponse(200, { accessToken: 'fresh' }));
      h.queues.me.push(() => jsonResponse(200, meBody));

      const second = await h.client.fetchMultisigMe(network);
      expect(second).toEqual(meBody);
    } finally {
      vi.useRealTimers();
    }
  });
});
