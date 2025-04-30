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
export type LeatherApiSip10Token =
  paths['/v1/tokens/sip10s/{principal}']['get']['responses']['200']['content']['application/json'];

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

  async fetchNativeTokenPriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price-list'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/native', { signal });
        if (data?.format !== 'list') {
          throw new Error('Unrecognized collection format');
        }
        return data?.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchNativeTokenPriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price-map'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/native', {
          signal,
          params: {
            query: { format: 'map' },
          },
        });
        if (data?.format !== 'map') {
          throw new Error('Unrecognized collection format');
        }
        return data?.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchNativeTokenPrice(symbol: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-price', symbol],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/native/{symbol}', {
          signal,
          params: { path: { symbol } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchNativeTokenDescription(symbol: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-native-token-description', symbol],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/native/{symbol}/description', {
          signal,
          params: { path: { symbol } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchRunePriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-price-list'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/runes', { signal });
        if (data?.format !== 'list') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchRunePriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-price-map'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/runes', {
          signal,
          params: { query: { format: 'map' } },
        });
        if (data?.format !== 'map') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchRunePrice(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-price', runeName],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/runes/{runeName}', {
          signal,
          params: { path: { runeName } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchSip10PriceList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-price-list'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/sip10s', { signal });
        if (data?.format !== 'list') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchSip10PriceMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-price-map'],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/sip10s', {
          signal,
          params: { query: { format: 'map' } },
        });
        if (data?.format !== 'map') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchSip10Price(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-price', principal],
      async () => {
        const { data } = await this.client.GET('/v1/market/prices/sip10s/{principal}', {
          signal,
          params: { path: { principal } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.fiveMinutes }
    );
  }

  async fetchSip10TokenList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token-list'],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/sip10s', { signal });
        if (data?.format !== 'list') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchSip10TokenMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token-map'],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/sip10s', {
          signal,
          params: { query: { format: 'map' } },
        });
        if (data?.format !== 'map') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchSip10Token(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token', principal],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/sip10s/{principal}', {
          signal,
          params: { path: { principal } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneMonth }
    );
  }

  async fetchSip10TokenDescription(principal: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-sip10-token-description', principal],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/sip10s/{principal}/description', {
          signal,
          params: { path: { principal } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchRuneList(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-list'],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/runes', { signal });
        if (data?.format !== 'list') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchRuneMap(signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-map'],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/runes', {
          signal,
          params: { query: { format: 'map' } },
        });
        if (data?.format !== 'map') {
          throw new Error('Unrecognized collection format');
        }
        return data.data;
      },
      { ttl: HttpCacheTimeMs.oneDay }
    );
  }

  async fetchRune(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune', runeName],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/runes/{runeName}', {
          signal,
          params: { path: { runeName } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneMonth }
    );
  }

  async fetchRuneDescription(runeName: string, signal?: AbortSignal) {
    return await this.cacheService.fetchWithCache(
      ['leather-api-rune-description', runeName],
      async () => {
        const { data } = await this.client.GET('/v1/tokens/runes/{runeName}/description', {
          signal,
          params: { path: { runeName } },
        });
        return data!;
      },
      { ttl: HttpCacheTimeMs.oneDay }
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
