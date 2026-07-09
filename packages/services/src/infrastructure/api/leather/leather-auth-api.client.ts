import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';
import { v4 as uuidv4 } from 'uuid';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import type { AuthNetworkId, VaultMembershipStatus, VaultStatus } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import type { AuthSessionService } from '../../auth/auth-session.service';
import type { Environment } from '../../environment';
import { RateLimiterService, RateLimiterType } from '../../rate-limiter/rate-limiter.service';
import { LeatherApiError } from './leather-api.error';
import { LeatherApiPageRequest } from './leather-api.pagination';
import { paths } from './leather-api.types';

type AuthRequestBody = paths['/v1/auth']['post']['requestBody']['content']['application/json'];

const refreshTimeoutMs = 15_000;

@injectable()
export class LeatherAuthApiClient {
  private readonly client;
  private readonly refreshInFlight = new Map<AuthNetworkId, Promise<string>>();

  constructor(
    @inject(Types.AuthSessionService) private readonly sessions: AuthSessionService,
    @inject(Types.Environment) env: Environment,
    private readonly rateLimiter: RateLimiterService
  ) {
    const clientId = uuidv4();

    this.client = createClient<paths>({
      baseUrl:
        env.environment === 'production'
          ? LEATHER_API_URL_PRODUCTION
          : (env.leatherApiUrl ?? LEATHER_API_URL_STAGING),
    });

    this.client.use({
      onRequest({ request }) {
        request.headers.set('X-Client-ID', clientId);
        return request;
      },
      onResponse({ response }) {
        if (!response.ok) {
          throw new LeatherApiError(response.url, response.status, response.statusText);
        }
      },
    });
  }

  async authenticate(body: AuthRequestBody) {
    const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
      this.client.POST('/v1/auth', { body })
    );
    return data!;
  }

  async refreshAccessToken(refreshToken: string, signal?: AbortSignal) {
    const { data } = await this.rateLimiter.add(RateLimiterType.Leather, () =>
      this.client.POST('/v1/auth/refresh', { body: { refreshToken }, signal })
    );
    return data!;
  }

  async fetchMultisigMe(network: AuthNetworkId, { signal }: { signal?: AbortSignal } = {}) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/me', { signal, headers });
        return data!;
      })
    );
  }

  async fetchMultisigVaults(
    network: AuthNetworkId,
    filters?: { status?: VaultStatus; membershipStatus?: VaultMembershipStatus },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/vaults', {
          params: { query: filters },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async fetchMultisigVault(
    network: AuthNetworkId,
    vaultId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/vaults/{id}', {
          params: { path: { id: vaultId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async createMultisigVault(
    network: AuthNetworkId,
    params: {
      name: string;
      theme?: string;
      icon?: string;
      members: { address: string; name?: string }[];
    },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vaults', {
          body: { ...params, network },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async updateMultisigVault(
    network: AuthNetworkId,
    vaultId: string,
    update: { name: string; theme?: string | null; icon?: string | null },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.PATCH('/v1/multisig/vaults/{id}', {
          params: { path: { id: vaultId } },
          body: update,
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async cancelMultisigVault(
    network: AuthNetworkId,
    vaultId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vaults/{id}/cancel', {
          params: { path: { id: vaultId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async joinMultisigVault(
    network: AuthNetworkId,
    membershipId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vault-members/{id}/join', {
          params: { path: { id: membershipId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async declineMultisigVault(
    network: AuthNetworkId,
    membershipId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vault-members/{id}/decline', {
          params: { path: { id: membershipId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async fetchMultisigVaultAccounts(
    network: AuthNetworkId,
    vaultId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/vaults/{id}/accounts', {
          params: { path: { id: vaultId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async createMultisigVaultAccount(
    network: AuthNetworkId,
    vaultId: string,
    params: { name: string; icon?: string; threshold: number; index: number },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vaults/{id}/accounts', {
          params: { path: { id: vaultId } },
          body: params,
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async recoverMultisigVaultAccounts(
    network: AuthNetworkId,
    vaultId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/vaults/{id}/accounts/recover', {
          params: { path: { id: vaultId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async fetchMultisigVaultAccount(
    network: AuthNetworkId,
    accountId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/vault-accounts/{id}', {
          params: { path: { id: accountId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async updateMultisigVaultAccount(
    network: AuthNetworkId,
    accountId: string,
    update: { name: string; icon?: string | null },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.PATCH('/v1/multisig/vault-accounts/{id}', {
          params: { path: { id: accountId } },
          body: update,
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async fetchMultisigVaultAccountTransactions(
    network: AuthNetworkId,
    vaultAccountId: string,
    pageRequest: LeatherApiPageRequest,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/vault-accounts/{id}/transactions', {
          params: {
            path: { id: vaultAccountId },
            query: {
              page: pageRequest.page.toString(),
              pageSize: pageRequest.pageSize.toString(),
            },
          },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async fetchMultisigTransaction(
    network: AuthNetworkId,
    transactionId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.GET('/v1/multisig/transactions/{id}', {
          params: { path: { id: transactionId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async addMultisigTransactionSignatures(
    network: AuthNetworkId,
    transactionId: string,
    body: { signatures: { signature: string; inputIndex?: number }[] },
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/transactions/{id}/signatures', {
          params: { path: { id: transactionId } },
          body,
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async cancelMultisigTransaction(
    network: AuthNetworkId,
    transactionId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/transactions/{id}/cancel', {
          params: { path: { id: transactionId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  async broadcastMultisigTransaction(
    network: AuthNetworkId,
    transactionId: string,
    { signal }: { signal?: AbortSignal } = {}
  ) {
    return this.authed(network, headers =>
      this.rateLimiter.add(RateLimiterType.Leather, async () => {
        const { data } = await this.client.POST('/v1/multisig/transactions/{id}/broadcast', {
          params: { path: { id: transactionId } },
          headers,
          signal,
        });
        return data!;
      })
    );
  }

  private bearerHeaders(accessToken: string | undefined): Record<string, string> {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  private refreshOnce(network: AuthNetworkId): Promise<string> {
    const existing = this.refreshInFlight.get(network);
    if (existing) {
      return existing;
    }

    const refreshToken = this.sessions.getSession(network)?.refreshToken;
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), refreshTimeoutMs);

    const refresh = this.refreshAccessToken(refreshToken, controller.signal)
      .then(({ accessToken }) => {
        const current = this.sessions.getSession(network);
        if (current?.refreshToken !== refreshToken) {
          const currentAccessToken = current?.accessToken;
          if (!currentAccessToken) {
            throw new Error('Session changed during refresh');
          }
          return currentAccessToken;
        }
        this.sessions.onTokenRefreshed(network, accessToken);
        return accessToken;
      })
      .finally(() => {
        clearTimeout(timeout);
        this.refreshInFlight.delete(network);
      });

    this.refreshInFlight.set(network, refresh);
    return refresh;
  }

  private async authed<T>(
    network: AuthNetworkId,
    run: (headers: Record<string, string>) => Promise<T>
  ): Promise<T> {
    const accessToken = this.sessions.getSession(network)?.accessToken;
    try {
      return await run(this.bearerHeaders(accessToken));
    } catch (error) {
      if (!LeatherApiError.isLeatherApiError(error) || error.status !== 401) {
        throw error;
      }

      let refreshedToken: string;
      try {
        refreshedToken = await this.refreshOnce(network);
      } catch {
        this.sessions.onAuthFailure(network);
        throw error;
      }

      try {
        return await run(this.bearerHeaders(refreshedToken));
      } catch (retryError) {
        if (LeatherApiError.isLeatherApiError(retryError) && retryError.status === 401) {
          this.sessions.onAuthFailure(network);
        }
        throw retryError;
      }
    }
  }
}
