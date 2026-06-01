import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';
import { v4 as uuidv4 } from 'uuid';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import type { ChainNetworkId } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import type { Environment } from '../../environment';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import type { TokenAuthService } from '../../token-auth.service';
import { LeatherApiError } from './leather-api.error';
import { paths } from './leather-api.types';

@injectable()
export class LeatherAuthApiClient {
  private readonly client;
  private readonly network: ChainNetworkId = 'stx:mainnet';
  private isRefreshing = false;

  constructor(
    @inject(Types.TokenAuthService) private readonly tokenProvider: TokenAuthService,
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    const clientId = uuidv4();
    const provider = this.tokenProvider;
    const network = this.network;

    this.client = createClient<paths>({
      baseUrl:
        env.environment === 'production'
          ? LEATHER_API_URL_PRODUCTION
          : (env.leatherApiUrl ?? LEATHER_API_URL_STAGING),
    });

    this.client.use({
      onRequest({ request }) {
        request.headers.set('X-Client-ID', clientId);
        const token = provider.getSession(network)?.accessToken;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        return request;
      },
      onResponse({ response }) {
        if (!response.ok) {
          throw new LeatherApiError(response.url, response.status, response.statusText);
        }
      },
    });
  }

  async authenticate(signature: string, publicKey: string, timestamp: number) {
    const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
      this.client.POST('/v1/auth', {
        body: { signature, publicKey, timestamp },
      })
    );
    return data!;
  }

  async refreshAccessToken(refreshToken: string) {
    const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
      this.client.POST('/v1/auth/refresh', {
        body: { refreshToken },
      })
    );
    return data!;
  }

  async fetchMe({ signal }: { signal?: AbortSignal } = {}) {
    return this.fetchWithAuth(async () => {
      const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
        this.client.GET('/v1/multisig/me', { signal })
      );
      return data!;
    });
  }

  private async fetchWithAuth<T>(fetchFn: () => Promise<T>): Promise<T> {
    try {
      return await fetchFn();
    } catch (error) {
      if (!LeatherApiError.isLeatherApiError(error) || error.status !== 401 || this.isRefreshing) {
        throw error;
      }

      const refreshToken = this.tokenProvider.getSession(this.network)?.refreshToken;
      if (!refreshToken) {
        this.tokenProvider.onAuthFailure(this.network);
        throw error;
      }

      try {
        this.isRefreshing = true;
        const result = await this.refreshAccessToken(refreshToken);
        this.tokenProvider.onTokenRefreshed(this.network, result.accessToken);
        return await fetchFn();
      } catch {
        this.tokenProvider.onAuthFailure(this.network);
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }
  }
}
