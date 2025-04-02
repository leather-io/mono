import { inject, injectable } from 'inversify';
import createClient from 'openapi-fetch';
import { v4 as uuidv4 } from 'uuid';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { SupportedBlockchains } from '@leather.io/models';

import { Types } from '../../../inversify.types';
import type { HttpCacheService } from '../../cache/http-cache.service';
import { HttpCacheTimeMs } from '../../cache/http-cache.utils';
import type { Environment } from '../../environment';
import { selectBitcoinNetwork } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { LeatherApiPageRequest, getPageRequestQueryParams } from './leather-api.pagination';
import { paths } from './leather-api.types';

export type LeatherApiBitcoinTransaction =
  paths['/v1/transactions/{descriptor}']['get']['responses'][200]['content']['application/json']['data'][number];

@injectable()
export class LeatherApiClient {
  private readonly client;

  constructor(
    @inject(Types.CacheService) private readonly cacheService: HttpCacheService,
    @inject(Types.SettingsService) private readonly settingsService: SettingsService,
    @inject(Types.Environment) env: Environment
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
          throw new Error(
            `Leather API (${response.url}): ${response.status} ${response.statusText}`
          );
        }
      },
    });
  }

  async fetchUtxos(descriptor: string, signal?: AbortSignal) {
    const network = this.settingsService.getSettings().network.chain.bitcoin.bitcoinNetwork;
    return await this.cacheService.fetchWithCache(
      ['leather-api-utxos', network, descriptor],
      async () => {
        const { data } = await this.client.GET(`/v1/utxos/{descriptor}`, {
          params: { path: { descriptor }, query: { network } },
          signal,
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async fetchBitcoinTransactions(
    descriptor: string,
    pageRequest: LeatherApiPageRequest,
    signal?: AbortSignal
  ) {
    const params = getPageRequestQueryParams(pageRequest);
    const network = selectBitcoinNetwork(this.settingsService.getSettings());
    return await this.cacheService.fetchWithCache(
      ['leather-api-transactions', descriptor, params.toString()],
      async () => {
        const { data } = await this.client.GET(`/v1/transactions/{descriptor}`, {
          params: {
            path: { descriptor },
            query: {
              network,
              page: pageRequest.page.toString(),
              pageSize: pageRequest.pageSize.toString(),
            },
          },
          signal,
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }

  async fetchFiatExchangeRates(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-fiat-rates'],
      async () => {
        const { data } = await this.client.GET('/v1/market/fiat-rates', { signal });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchCryptoPrices(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-crypto-prices'],
      async () => {
        const { data } = await this.client.GET('/v1/market/crypto-prices', { signal });
        return data!;
      },
      { ttl: HttpCacheTimeMs.tenMinutes }
    );
  }

  async fetchSip10Prices(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-prices'],
      async () => {
        const { data } = await this.client.GET('/v1/market/sip10-prices', { signal });
        return data!;
      },
      { ttl: HttpCacheTimeMs.tenMinutes }
    );
  }

  async registerAddresses(
    {
      addresses,
      notificationToken,
      chain,
    }: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    signal?: AbortSignal
  ) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-register-notifications', addresses, notificationToken, chain],
      async () => {
        const { data } = await this.client.POST('/v1/notifications/register', {
          body: {
            addresses,
            notificationToken,
            chain,
            network: 'mainnet',
          },
          signal,
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveSeconds }
    );
  }
}
